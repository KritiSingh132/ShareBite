from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, me, register_ngo, register_restaurant, register_delivery_agent
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


router = DefaultRouter()
router.register('users', UserViewSet, basename='user')


urlpatterns = [
	path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
	path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
	path('me/', me, name='accounts-me'),
	path('register/ngo/', register_ngo, name='register-ngo'),
	path('register/restaurant/', register_restaurant, name='register-restaurant'),
	path('register/delivery_agent/', register_delivery_agent, name='register-delivery-agent'),
	path('', include(router.urls)),
]


