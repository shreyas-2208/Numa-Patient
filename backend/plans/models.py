from django.db import models

class SessionPlan(models.Model):
    DOCTOR_CHOICES = [
        ("psychiatrist", "Psychiatrist"),
        ("psychologist", "Psychologist"),
    ]

    doctor_type = models.CharField(max_length=50, choices=DOCTOR_CHOICES)
    duration_minutes = models.PositiveIntegerField()
    title = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.doctor_type} - {self.title} ({self.duration_minutes} min)"


class PackagePlan(models.Model):
    DOCTOR_CHOICES = [
        ("psychiatrist", "Psychiatrist"),
        ("psychologist", "Psychologist"),
    ]

    doctor_type = models.CharField(max_length=50, choices=DOCTOR_CHOICES)
    sessions_count = models.PositiveIntegerField()
    title = models.CharField(max_length=100)
    original_price = models.DecimalField(max_digits=10, decimal_places=2)
    discounted_price = models.DecimalField(max_digits=10, decimal_places=2)
    per_session_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.doctor_type} - {self.title} ({self.sessions_count} sessions)"
