from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, me
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


router = DefaultRouter()
router.register('users', UserViewSet, basename='user')


urlpatterns = [
	path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
	path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
	path('me/', me, name='accounts-me'),
	path('', include(router.urls)),
]


