from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone


class User(AbstractUser):
	class Roles(models.TextChoices):
		RESTAURANT = 'restaurant', 'Restaurant'
		NGO = 'ngo', 'NGO'
		ADMIN = 'admin', 'Admin'
		DELIVERY_AGENT = 'delivery_agent', 'Delivery Agent'

	role = models.CharField(
		max_length=32,
		choices=Roles.choices,
		default=Roles.RESTAURANT,
		db_index=True
	)

	def __str__(self) -> str:
		return f"{self.username} ({self.get_role_display()})"


class RestaurantProfile(models.Model):
	user = models.OneToOneField('accounts.User', on_delete=models.CASCADE, related_name='restaurant_profile')
	organization_name = models.CharField(max_length=255)
	phone = models.CharField(max_length=32, blank=True)
	address = models.CharField(max_length=512, blank=True)
	latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
	longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
	created_at = models.DateTimeField(default=timezone.now)

	class Meta:
		verbose_name = "Restaurant Profile"
		verbose_name_plural = "Restaurant Profiles"

	def __str__(self) -> str:
		return f"{self.organization_name} ({self.user.username})"


class NGOProfile(models.Model):
	user = models.OneToOneField('accounts.User', on_delete=models.CASCADE, related_name='ngo_profile')
	organization_name = models.CharField(max_length=255)
	phone = models.CharField(max_length=32, blank=True)
	address = models.CharField(max_length=512, blank=True)
	latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
	longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
	created_at = models.DateTimeField(default=timezone.now)

	class Meta:
		verbose_name = "NGO Profile"
		verbose_name_plural = "NGO Profiles"

	def __str__(self) -> str:
		return f"{self.organization_name} ({self.user.username})"
