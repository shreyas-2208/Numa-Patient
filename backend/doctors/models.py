# doctors/models.py
from django.db import models
from django.conf import settings

class Doctor(models.Model):
    GENDER_CHOICES = [
        ("male", "Male"),
        ("female", "Female"),
        ("other", "Other"),
    ]

    SPECIALIZATION_CHOICES = [
        ("psychiatrist", "Psychiatrist"),
        ("psychologist", "Psychologist"),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="assigned_doctor",
        unique=True
    )

    name = models.CharField(max_length=100)
    age = models.PositiveIntegerField()  
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    specialization = models.CharField(max_length=20, choices=SPECIALIZATION_CHOICES)
    bio = models.TextField()
    languages = models.JSONField(default=list, blank=True)
    years_of_experience = models.PositiveIntegerField(blank=True, null=True)
    zoho_calendar_id = models.CharField(max_length=255, null=True, blank=True)
    phone_number = models.CharField(max_length=10)
    email = models.EmailField(default="")
    zoho_staff_id = models.CharField(max_length=100, null=True, blank=True)
    zoho_calendar_id = models.CharField(max_length=255, null=True, blank=True)
    image = models.ImageField(
        upload_to="doctors/",  # will store under MEDIA_ROOT/doctors/
        null=True,
        blank=True
    )

    last_assigned = models.DateTimeField(null=True, blank=True)
    def __str__(self):
        return f"Dr. {self.name} ({self.specialization})"
