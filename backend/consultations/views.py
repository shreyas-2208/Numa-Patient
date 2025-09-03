from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from appointments.models import Appointment
from .models import Consultation
from .services import create_meeting
from notifications.services import send_email_notification, send_sms_notification

@csrf_exempt
def create_consultation(request, appointment_id):
    appointment = get_object_or_404(Appointment, id=appointment_id, status="approved")

    # If already created, return existing consultation
    if hasattr(appointment, "consultation"):
        return JsonResponse({"meeting_link": appointment.consultation.meeting_link})

    meeting_link = create_meeting(appointment)

    consultation = Consultation.objects.create(
        appointment=appointment,
        meeting_link=meeting_link
    )

    # Send notifications
    send_email_notification(
        to_email=appointment.patient.email,
        subject="Your Consultation Link",
        message=f"Dear {appointment.patient.username},\n\nYour consultation is confirmed. Join here: {meeting_link}"
    )

    send_sms_notification(
        to_number=appointment.patient.profile.phone,  # assuming phone in profile
        message=f"Your consultation is confirmed. Join here: {meeting_link}"
    )

    consultation.notified = True
    consultation.save()

    return JsonResponse({"meeting_link": meeting_link})
