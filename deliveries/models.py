from django.db import models
from django.conf import settings
from django.utils import timezone


class Delivery(models.Model):
	class Status(models.TextChoices):
		ASSIGNED = 'assigned', 'Assigned'
		IN_TRANSIT = 'in_transit', 'In Transit'
		DELIVERED = 'delivered', 'Delivered'
		FAILED = 'failed', 'Failed'

	class Quality(models.TextChoices):
		UNKNOWN = 'unknown', 'Unknown'
		GOOD = 'good', 'Good'
		SPOILED = 'spoiled', 'Spoiled'

	request = models.OneToOneField('donations.Request', on_delete=models.CASCADE, related_name='delivery', null=True, blank=True)
	delivery_agent = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.SET_NULL,
		null=True,
		blank=True,
		related_name='deliveries',
		limit_choices_to={'role': 'delivery_agent'}
	)
	status = models.CharField(max_length=32, choices=Status.choices, default=Status.ASSIGNED, db_index=True)
	location_updates = models.JSONField(default=list, blank=True)  # [{lat, lng, ts}, ...]
	quality_status = models.CharField(max_length=16, choices=Quality.choices, default=Quality.UNKNOWN)
	pickup_time = models.DateTimeField(null=True, blank=True)
	dropoff_time = models.DateTimeField(null=True, blank=True)
	created_at = models.DateTimeField(default=timezone.now)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ['-updated_at']
		indexes = [
			models.Index(fields=['status']),
			models.Index(fields=['updated_at'])
		]

	def __str__(self) -> str:
		return f"Delivery #{self.pk} ({self.get_status_display()})"
