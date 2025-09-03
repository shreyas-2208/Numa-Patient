# payments/models.py
from django.db import models
from django.conf import settings
from appointments.models import Appointment

class Payment(models.Model):
    STATUS_CHOICES = [
        ("initiated", "Initiated"),
        ("success", "Success"),
        ("failed", "Failed"),
    ]

    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name="payment")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="payments")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default="INR")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="initiated")
    zoho_payment_id = models.CharField(max_length=200, blank=True, null=True)   # returned by Zoho
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment {self.id} for {self.appointment}"
