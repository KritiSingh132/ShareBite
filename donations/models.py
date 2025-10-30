from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator


class FoodDonation(models.Model):
	class Status(models.TextChoices):
		AVAILABLE = 'available', 'Available'
		ASSIGNED = 'assigned', 'Assigned'
		COLLECTED = 'collected', 'Collected'
		DISTRIBUTED = 'distributed', 'Distributed'
		CANCELLED = 'cancelled', 'Cancelled'

	restaurant = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name='donations',
		limit_choices_to={'role': 'restaurant'}
	)
	food_type = models.CharField(max_length=128, blank=True, default='')
	description = models.TextField(blank=True)
	quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])
	expiry = models.DateTimeField(null=True, blank=True)
	status = models.CharField(max_length=32, choices=Status.choices, default=Status.AVAILABLE, db_index=True)
	pickup_address = models.CharField(max_length=512, blank=True, default='')
	latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
	longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
	notes = models.TextField(blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ['-created_at']
		indexes = [
			models.Index(fields=['status']),
			models.Index(fields=['expiry'])
		]

	def __str__(self) -> str:
		return f"{self.food_type} x{self.quantity} ({self.get_status_display()})"


class Request(models.Model):
	class Status(models.TextChoices):
		PENDING = 'pending', 'Pending'
		APPROVED = 'approved', 'Approved'
		REJECTED = 'rejected', 'Rejected'
		CANCELLED = 'cancelled', 'Cancelled'
		FULFILLED = 'fulfilled', 'Fulfilled'

	donation = models.ForeignKey('donations.FoodDonation', on_delete=models.CASCADE, related_name='requests')
	ngo = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name='requests_made',
		limit_choices_to={'role': 'ngo'}
	)
	status = models.CharField(max_length=32, choices=Status.choices, default=Status.PENDING, db_index=True)
	message = models.CharField(max_length=512, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	decided_at = models.DateTimeField(null=True, blank=True)

	class Meta:
		unique_together = ('donation', 'ngo')
		ordering = ['-created_at']
		indexes = [models.Index(fields=['status'])]

	def __str__(self) -> str:
		return f"Request #{self.pk} for donation {self.donation_id} by {self.ngo.username} ({self.get_status_display()})"

# Create your models here.
