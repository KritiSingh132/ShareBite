from rest_framework import viewsets, permissions
from rest_framework import serializers
from .models import FoodDonation, Request

# new imports for scan endpoint
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from deliveries.classifier import classify_image
from notifications.models import Notification
from accounts.models import User


class IsRestaurantCreateOnly(permissions.BasePermission):
	def has_permission(self, request, view):
		if request.method in ('POST', 'PUT', 'PATCH', 'DELETE'):
			return bool(request.user and request.user.is_authenticated and getattr(request.user, 'role', '') == 'restaurant')
		return True


class IsNGOCreateOnly(permissions.BasePermission):
	def has_permission(self, request, view):
		if request.method in ('POST', 'PUT', 'PATCH', 'DELETE'):
			return bool(request.user and request.user.is_authenticated and getattr(request.user, 'role', '') == 'ngo')
		return True


class FoodDonationSerializer(serializers.ModelSerializer):
	class Meta:
		model = FoodDonation
		fields = '__all__'
		read_only_fields = ['id', 'restaurant', 'created_at', 'updated_at']


class RequestSerializer(serializers.ModelSerializer):
	class Meta:
		model = Request
		fields = '__all__'
		read_only_fields = ['id', 'ngo', 'created_at']


class FoodDonationViewSet(viewsets.ModelViewSet):
	queryset = FoodDonation.objects.all().order_by('-created_at')
	serializer_class = FoodDonationSerializer
	permission_classes = [IsRestaurantCreateOnly]

	def perform_create(self, serializer):
		donation = serializer.save(restaurant=self.request.user)
		# Notify NGOs about a new donation
		try:
			msg = f"New donation posted: {donation.food_type or 'Food'} ×{donation.quantity} by {donation.restaurant.username}."
			for ngo in User.objects.filter(role='ngo'):
				Notification.objects.create(user=ngo, message=msg)
		except Exception:
			pass

	def get_permissions(self):
		if self.action in ['create', 'update', 'partial_update', 'destroy']:
			return [IsRestaurantCreateOnly()]
		return [permissions.AllowAny()]


class RequestViewSet(viewsets.ModelViewSet):
	queryset = Request.objects.all().order_by('-created_at')
	serializer_class = RequestSerializer
	permission_classes = [IsNGOCreateOnly]

	def perform_create(self, serializer):
		req = serializer.save(ngo=self.request.user)
		# Create notifications to delivery agents and restaurant and NGO
		try:
			don = req.donation
			msg = f"Pickup requested for donation #{don.id} ({don.food_type}) at {don.pickup_address or 'pickup location'}."
			for agent in User.objects.filter(role='delivery_agent'):
				Notification.objects.create(user=agent, message=msg)
			# notify restaurant owner
			Notification.objects.create(user=don.restaurant, message=f"Your donation #{don.id} has been requested by an NGO. Delivery agents have been notified for pickup.")
			# notify requesting NGO that agents were notified
			Notification.objects.create(user=req.ngo, message=f"Your request for donation #{don.id} has been sent. Delivery agents have been notified for pickup.")
		except Exception:
			pass

	def get_permissions(self):
		return [IsNGOCreateOnly()]


# Image scan endpoint scoped under donations
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def scan_food_image_donation(request):
	"""Accept an uploaded image under 'image' and return quality classification.
	Optionally receive 'donation_id' for future linkage (ignored for now).
	"""
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

	# Resize large images for faster analysis
	max_dim = 640
	w, h = pil_img.size
	if max(w, h) > max_dim:
		scale = max_dim / float(max(w, h))
		pil_img = pil_img.resize((int(w * scale), int(h * scale)))

	result = classify_image(pil_img)
	return Response(result)
