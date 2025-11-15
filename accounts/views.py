from rest_framework import viewsets, permissions
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .models import User, NGOProfile, RestaurantProfile
from rest_framework import serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db import transaction


class UserSerializer(serializers.ModelSerializer):
	class Meta:
		model = User
		fields = ['id', 'username', 'email', 'role']
		read_only_fields = ['id']


class UserViewSet(viewsets.ReadOnlyModelViewSet):
	queryset = User.objects.all()
	serializer_class = UserSerializer
	permission_classes = [permissions.IsAdminUser]


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def me(request):
	user = request.user
	data = {
		'id': user.id,
		'username': user.username,
		'email': user.email,
		'role': getattr(user, 'role', None),
	}
	return Response(data)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_ngo(request):
	"""Register a new NGO user and profile.
	Expected JSON:
	{
	  username, password, email?, organization_name, phone?, address?, latitude?, longitude?
	}
	"""
	data = request.data or {}
	username = str(data.get('username') or '').strip()
	password = str(data.get('password') or '').strip()
	organization_name = str(data.get('organization_name') or '').strip()
	if not username or not password or not organization_name:
		return Response({'detail': 'username, password, and organization_name are required'}, status=400)
	if User.objects.filter(username=username).exists():
		return Response({'detail': 'username already exists'}, status=400)
	with transaction.atomic():
		user = User.objects.create(username=username, email=data.get('email') or '', role='ngo', is_staff=False, is_superuser=False)
		user.set_password(password)
		user.save()
		NGOProfile.objects.create(
			user=user,
			organization_name=organization_name,
			phone=str(data.get('phone') or ''),
			address=str(data.get('address') or ''),
			latitude=data.get('latitude') or None,
			longitude=data.get('longitude') or None,
		)
	return Response({'id': user.id, 'username': user.username, 'email': user.email, 'role': user.role}, status=201)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_restaurant(request):
	"""Register a new Restaurant user and profile.
	Expected JSON:
	{
	  username, password, email?, organization_name, phone?, address?, latitude?, longitude?
	}
	"""
	data = request.data or {}
	username = str(data.get('username') or '').strip()
	password = str(data.get('password') or '').strip()
	organization_name = str(data.get('organization_name') or '').strip()
	if not username or not password or not organization_name:
		return Response({'detail': 'username, password, and organization_name are required'}, status=400)
	if User.objects.filter(username=username).exists():
		return Response({'detail': 'username already exists'}, status=400)
	with transaction.atomic():
		user = User.objects.create(username=username, email=data.get('email') or '', role='restaurant', is_staff=False, is_superuser=False)
		user.set_password(password)
		user.save()
		RestaurantProfile.objects.create(
			user=user,
			organization_name=organization_name,
			phone=str(data.get('phone') or ''),
			address=str(data.get('address') or ''),
			latitude=data.get('latitude') or None,
			longitude=data.get('longitude') or None,
		)
	return Response({'id': user.id, 'username': user.username, 'email': user.email, 'role': user.role}, status=201)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_delivery_agent(request):
	"""Register a new Delivery Agent user.
	Expected JSON:
	{
	  username, password, email?, phone?
	}
	"""
	data = request.data or {}
	username = str(data.get('username') or '').strip()
	password = str(data.get('password') or '').strip()
	if not username or not password:
		return Response({'detail': 'username and password are required'}, status=400)
	if User.objects.filter(username=username).exists():
		return Response({'detail': 'username already exists'}, status=400)
	with transaction.atomic():
		user = User.objects.create(username=username, email=data.get('email') or '', role='delivery_agent', is_staff=False, is_superuser=False)
		user.set_password(password)
		user.save()
	return Response({'id': user.id, 'username': user.username, 'email': user.email, 'role': user.role}, status=201)


TokenObtainPairView  # re-export for urls import
TokenRefreshView

# Create your views here.
