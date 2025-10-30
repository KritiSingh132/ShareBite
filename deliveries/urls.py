from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DeliveryViewSet, scan_food_image


router = DefaultRouter()
router.register('', DeliveryViewSet, basename='delivery')


urlpatterns = [
    # Place specific endpoints BEFORE router include to avoid pk conflicts (e.g., 'scan' treated as pk)
    path('scan/', scan_food_image, name='food-scan'),
    path('', include(router.urls)),
]


