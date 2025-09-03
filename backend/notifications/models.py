# notifications/models.py
from django.db import models
from django.conf import settings

class Notification(models.Model):
    NOTIF_TYPE_CHOICES = [
        ("email", "Email"),
        ("sms", "SMS"),
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    notif_type = models.CharField(max_length=10, choices=NOTIF_TYPE_CHOICES)
    subject = models.CharField(max_length=255, blank=True, null=True)
    message = models.TextField()
    status = models.CharField(max_length=20, default="sent")  # sent, failed
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.notif_type} to {self.user.username} - {self.status}"
