from rest_framework import viewsets, permissions
from rest_framework import serializers
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from .models import Delivery
from .classifier import classify_image


class DeliverySerializer(serializers.ModelSerializer):
	class Meta:
		model = Delivery
		fields = '__all__'
		read_only_fields = ['id', 'updated_at']


class DeliveryViewSet(viewsets.ModelViewSet):
	queryset = Delivery.objects.all().order_by('-updated_at')
	serializer_class = DeliverySerializer
	permission_classes = [permissions.IsAuthenticated]

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def scan_food_image(request):
    """Accepts an uploaded image file and returns a quality classification.

    Form field: 'image' -> file
    Optional: 'donation_id' to associate in logs in future (ignored for now)
    """
    # Import PIL locally to validate availability for decoding
    try:
        from PIL import Image  # type: ignore
    except Exception:
        return Response({'detail': 'Pillow not available on server'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    image_file = request.FILES.get('image')
    if not image_file:
        return Response({'detail': 'image file is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        pil_img = Image.open(image_file).convert('RGB')
    except Exception:
        return Response({'detail': 'invalid image'}, status=status.HTTP_400_BAD_REQUEST)

    # Resize large images for faster analysis, keeping aspect ratio
    max_dim = 640
    w, h = pil_img.size
    if max(w, h) > max_dim:
        scale = max_dim / float(max(w, h))
        pil_img = pil_img.resize((int(w * scale), int(h * scale)))

    result = classify_image(pil_img)
    return Response(result)
