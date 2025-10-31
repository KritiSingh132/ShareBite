from django.shortcuts import render
from rest_framework import viewsets, permissions, serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
	class Meta:
		model = Notification
		fields = ['id', 'message', 'is_read', 'created_at']
		read_only_fields = ['id', 'created_at']


class NotificationViewSet(viewsets.ModelViewSet):
	serializer_class = NotificationSerializer
	permission_classes = [permissions.IsAuthenticated]

	def get_queryset(self):
		return Notification.objects.filter(user=self.request.user).order_by('-created_at')

	def perform_update(self, serializer):
		# ensure user cannot reassign
		serializer.save()
