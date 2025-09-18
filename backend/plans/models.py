from django.db import models

class SessionPlan(models.Model):
    CATEGORY_CHOICES = [
        ("core", "Core - Psychiatrist Led"),
        ("balance", "Balance - Psychologist Led"),
        ("couples", "Couples Sessions"),
    ]

    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default="core")
    doctor_type = models.CharField(max_length=50, choices=[
        ("psychiatrist", "Psychiatrist"),
        ("psychologist", "Psychologist"),
    ])
    title = models.CharField(max_length=100)  
    duration_minutes = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True, null=True)
    is_popular = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.get_category_display()} - {self.title} ({self.duration_minutes} min)"


class PackagePlan(models.Model):
    CATEGORY_CHOICES = [
        ("core", "Core - Psychiatrist Led Package Deals"),
        ("balance", "Balance - Psychologist Led Package Deals"),
    ]

    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default="core")
    DOCTOR_CHOICES = [
        ("psychiatrist", "Psychiatrist"),
        ("psychologist", "Psychologist"),
    ]

    doctor_type = models.CharField(max_length=50, choices=DOCTOR_CHOICES)
    sessions_count = models.PositiveIntegerField()
    title = models.CharField(max_length=100)
    original_price = models.DecimalField(max_digits=10, decimal_places=2)
    discounted_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_percentage = models.PositiveIntegerField(default=0)
    per_session_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.doctor_type} - {self.title} ({self.sessions_count} sessions)"
