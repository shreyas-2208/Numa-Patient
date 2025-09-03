# doctors/models.py
from django.db import models
from django.conf import settings

class Doctor(models.Model):
    GENDER_CHOICES = [
        ("male", "Male"),
        ("female", "Female"),
        ("other", "Other"),
    ]

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="doctor_profile")
    name = models.CharField(max_length=100)
    age = models.PositiveIntegerField()
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    specialization = models.CharField(max_length=100)
    available_from = models.TimeField()
    available_to = models.TimeField()

    def __str__(self):
        return f"Dr. {self.name} ({self.specialization})"
