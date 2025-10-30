from django.db import models
from django.conf import settings
from django.utils import timezone


class Notification(models.Model):
	user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
	message = models.TextField()
	is_read = models.BooleanField(default=False)
	created_at = models.DateTimeField(default=timezone.now, db_index=True)

	class Meta:
		ordering = ['-created_at']

	def __str__(self) -> str:
		return f"Notification to {self.user.username} ({'read' if self.is_read else 'unread'})"
