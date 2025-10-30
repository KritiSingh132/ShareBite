from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FoodDonationViewSet, RequestViewSet, scan_food_image_donation


router = DefaultRouter()
router.register('items', FoodDonationViewSet, basename='donation')
router.register('requests', RequestViewSet, basename='donation-request')


urlpatterns = [
	# specific endpoints first
	path('scan/', scan_food_image_donation, name='donation-food-scan'),
	path('', include(router.urls)),
]


