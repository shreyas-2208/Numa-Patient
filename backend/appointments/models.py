# appointments/models.py
from django.db import models
from django.conf import settings
from doctors.models import Doctor   # import Doctor model
from plans.models import PackagePlan, SessionPlan  # import Package and PackageDeal models
class Appointment(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("payment_failed", "Payment Failed"),
        ("approved", "Approved"),
        ("scheduled", "Scheduled"),
        ("cancelled", "Cancelled"),
        ("completed", "Completed"),
        ("rescheduled", "Rescheduled"),
    ]

    patient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="appointments")
    doctor = models.ForeignKey(Doctor, on_delete=models.SET_NULL, null=True, blank=True, related_name="appointments")
    date = models.DateField()
    time = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    session_plan = models.ForeignKey(SessionPlan, on_delete=models.SET_NULL, null=True, blank=True)
    package_plan = models.ForeignKey(PackagePlan, on_delete=models.SET_NULL, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.patient.username} with {self.doctor.user.username if self.doctor else 'Unassigned'} on {self.date} {self.time}"
