from django.db import models
from django.conf import settings
from appointments.models import Appointment

class Consultation(models.Model):
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name="consultation")
    meeting_link = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    notified = models.BooleanField(default=False)  # whether notification sent

    def __str__(self):
        return f"Consultation for {self.appointment.patient.username} - {self.appointment.date}"
