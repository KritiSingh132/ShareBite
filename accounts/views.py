from rest_framework import viewsets, permissions
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .models import User
from rest_framework import serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response


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


TokenObtainPairView  # re-export for urls import
TokenRefreshView

# Create your views here.
