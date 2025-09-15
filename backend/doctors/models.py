# doctors/models.py
from django.db import models
from django.conf import settings

class Doctor(models.Model):
    GENDER_CHOICES = [
        ("male", "Male"),
        ("female", "Female"),
        ("other", "Other"),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="assigned_doctor",
        unique=True
    )
    name = models.CharField(max_length=100)
    age = models.PositiveIntegerField()  # not null + check (>=0)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    specialization = models.CharField(max_length=100)
    bio = models.TextField()
    calendar_id = models.CharField(max_length=255, null=True, blank=True)
    phone_number = models.CharField(max_length=10)
    staff_id = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f"Dr. {self.name} ({self.specialization})"
