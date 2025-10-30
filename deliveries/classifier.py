import os

# Lightweight image analysis without heavy ML deps
try:
	from PIL import Image, ImageStat, ImageOps, ImageFilter
except Exception:  # pragma: no cover
	Image = None
	ImageStat = None
	ImageOps = None
	ImageFilter = None

_ORT_AVAILABLE = False
_ORT_SESSION = None
_ORT_INPUT_NAME = None
_ORT_INPUT_SHAPE = None

try:  # optional dependency
	import onnxruntime as ort  # type: ignore
	import numpy as np  # type: ignore
	_ORT_AVAILABLE = True
except Exception:
	_ORT_AVAILABLE = False


def _maybe_init_ort_session():
	global _ORT_SESSION, _ORT_INPUT_NAME, _ORT_INPUT_SHAPE
	if not _ORT_AVAILABLE or _ORT_SESSION is not None:
		return
	model_path = os.environ.get('FOOD_QUALITY_MODEL', '').strip()
	if not model_path or not os.path.exists(model_path):
		return
	try:
		_ORT_SESSION = ort.InferenceSession(model_path, providers=["CPUExecutionProvider"])  # type: ignore
		inputs = _ORT_SESSION.get_inputs()  # type: ignore
		if not inputs:
			_ORT_SESSION = None
			return
		_ORT_INPUT_NAME = inputs[0].name
		_ORT_INPUT_SHAPE = inputs[0].shape
	except Exception:
		_ORT_SESSION = None


def _enhance_image(pil_image: "Image.Image"):
	# Fix orientation from EXIF and apply gentle autocontrast
	img = pil_image
	try:
		if ImageOps is not None:
			img = ImageOps.exif_transpose(img)
			img = ImageOps.autocontrast(img, cutoff=1)
	except Exception:
		pass
	return img


def _estimate_blur(img: "Image.Image"):
	# Edge magnitude variance as a blur proxy
	try:
		if ImageFilter is None:
			return None
		edges = img.convert('L').filter(ImageFilter.FIND_EDGES)
		stat = ImageStat.Stat(edges)
		return float(stat.var[0])
	except Exception:
		return None


def _center_and_corners(img: "Image.Image", size: int):
	w, h = img.size
	if w < size or h < size:
		img = img.resize((max(size, w), max(size, h)))
		w, h = img.size
	cx, cy = w // 2, h // 2
	half = size // 2
	crops = []
	# center
	crops.append(img.crop((cx - half, cy - half, cx - half + size, cy - half + size)))
	# tl, tr, bl, br
	crops.append(img.crop((0, 0, size, size)))
	crops.append(img.crop((w - size, 0, w, size)))
	crops.append(img.crop((0, h - size, size, h)))
	crops.append(img.crop((w - size, h - size, w, h)))
	return crops


def _preprocess_for_onnx(pil_image: "Image.Image"):
	# Determine target size from model or default to 224
	target = 224
	if _ORT_INPUT_SHAPE and isinstance(_ORT_INPUT_SHAPE, (list, tuple)):
		dims = [d for d in _ORT_INPUT_SHAPE if isinstance(d, int)]
		if len(dims) >= 3:
			target = dims[-1] if dims[-1] == dims[-2] else min(dims[-1], dims[-2])
			if not isinstance(target, int) or target <= 0:
				target = 224
	img = _enhance_image(pil_image)
	crops = _center_and_corners(img, target)

	def to_array(ximg):
		arr = np.array(ximg).astype('float32') / 255.0
		mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
		std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
		arr = (arr - mean) / std
		if _ORT_INPUT_SHAPE and len(_ORT_INPUT_SHAPE) == 4 and _ORT_INPUT_SHAPE[1] == 3:
			arr = np.transpose(arr, (2, 0, 1))
		return arr

	batch = np.stack([to_array(c) for c in crops], axis=0)
	return batch


def _infer_with_onnx(pil_image: "Image.Image"):
	if not _ORT_SESSION or not _ORT_INPUT_NAME:
		return None
	try:
		inp = _preprocess_for_onnx(pil_image)
		outputs = _ORT_SESSION.run(None, {_ORT_INPUT_NAME: inp})  # type: ignore
		if not outputs:
			return None
		logits = outputs[0]
		# Average over crops if batched
		if logits.ndim == 2:
			logits = logits.mean(axis=0)
		# Temperature scaling
		temp = float(os.environ.get('FOOD_QUALITY_TEMPERATURE', '1.0') or '1.0')
		logits = logits / max(1e-6, temp)
		exp = np.exp(logits - np.max(logits))
		probs = exp / np.sum(exp)
		# Optional label list
		labels_env = os.environ.get('FOOD_QUALITY_LABELS', 'fresh,stale,spoiled').split(',')
		labels = [s.strip() for s in labels_env if s.strip()]
		if probs.shape[-1] >= 3:
			idx = int(np.argmax(probs))
			name = labels[idx] if idx < len(labels) else str(idx)
			conf = float(probs.flat[idx])
			metrics = { (labels[i] if i < len(labels) else str(i)) : float(probs.flat[i]) for i in range(min(len(labels), probs.shape[-1])) }
			# quality hints
			blur_var = _estimate_blur(_enhance_image(pil_image))
			metrics['blur_variance'] = float(blur_var) if blur_var is not None else None
			return name, conf, metrics
		idx = int(np.argmax(probs))
		label = labels[idx] if idx < len(labels) else str(idx)
		conf = float(np.max(probs))
		return label, conf, {}
	except Exception:
		return None


def _classify_food_quality_heuristic(pil_image: "Image.Image"):
	"""Heuristic quality classifier using basic image stats.
	Returns (label, confidence, metrics)
	"""
	img = _enhance_image(pil_image)
	hsv_image = img.convert('HSV')
	stat_rgb = ImageStat.Stat(img)
	stat_hsv = ImageStat.Stat(hsv_image)

	r_mean, g_mean, b_mean = stat_rgb.mean
	brightness = (r_mean + g_mean + b_mean) / 3.0
	_, s_mean, _ = stat_hsv.mean
	r_var, g_var, b_var = stat_rgb.var
	contrast = (r_var + g_var + b_var) / 3.0

	brightness_n = brightness / 255.0
	saturation_n = s_mean / 255.0
	contrast_n = min(1.0, contrast / 8000.0)

	score = 0.4 * saturation_n + 0.35 * brightness_n + 0.25 * contrast_n

	if score >= 0.66:
		label = 'fresh'
	elif score >= 0.4:
		label = 'stale'
	else:
		label = 'spoiled'

	metrics = {
		'brightness': float(round(brightness_n, 3)),
		'saturation': float(round(saturation_n, 3)),
		'contrast': float(round(contrast_n, 3)),
	}
	blur_var = _estimate_blur(img)
	if blur_var is not None:
		metrics['blur_variance'] = float(blur_var)
		metrics['low_quality_image'] = bool(blur_var < 50.0 or brightness_n < 0.2)
	return label, float(round(score, 3)), metrics


def classify_image(pil_image: "Image.Image"):
	"""Classify a PIL image. Tries ONNX model if available, else heuristic.
	Returns dict with label, confidence, metrics, engine.
	"""
	if Image is None or ImageStat is None:
		raise RuntimeError('Pillow not available')

	_maybe_init_ort_session()
	if _ORT_AVAILABLE:
		result = _infer_with_onnx(pil_image)
		if result is not None:
			label, confidence, metrics = result
			return {
				'label': label,
				'confidence': float(round(confidence, 3)),
				'metrics': metrics,
				'engine': 'onnx',
			}

	label, confidence, metrics = _classify_food_quality_heuristic(pil_image)
	return {
		'label': label,
		'confidence': confidence,
		'metrics': metrics,
		'engine': 'heuristic',
	}



