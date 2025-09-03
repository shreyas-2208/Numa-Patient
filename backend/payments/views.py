# payments/views.py
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from django.contrib.auth.decorators import login_required
from appointments.models import Appointment
from .models import Payment
from .services import create_payment_link
from notifications.services import send_email_notification, send_sms_notification
from consultations.services import create_meeting
from consultations.models import Consultation

@login_required
def start_payment(request, appointment_id):
    appointment = get_object_or_404(Appointment, id=appointment_id, patient=request.user)

    # Example: Fee is fixed (later you can store fee in Doctor model)
    amount = 1000  

    payment, created = Payment.objects.get_or_create(
        appointment=appointment,
        user=request.user,
        defaults={"amount": amount, "currency": "INR"},
    )

    checkout_url = create_payment_link(payment)
    return JsonResponse({"checkout_url": checkout_url})


@csrf_exempt
def payment_webhook(request):
    if request.method == "POST":
        reference_id = request.POST.get("reference_id")   # This maps to Payment.id or Appointment.id
        zoho_payment_id = request.POST.get("payment_id")  # From Zoho response
        status = request.POST.get("status")

        # Here we assume reference_id == Payment.id (you can also map via Appointment.id)
        payment = get_object_or_404(Payment, id=reference_id)
        appointment = payment.appointment

        # Update payment
        payment.zoho_payment_id = zoho_payment_id
        payment.status = status
        payment.save()

        if status == "success":
            # ✅ Approve appointment
            appointment.status = "approved"
            appointment.save()

            # ✅ Create consultation if not exists
            if not hasattr(appointment, "consultation"):
                meeting_link = create_meeting(appointment)

                consultation = Consultation.objects.create(
                    appointment=appointment,
                    meeting_link=meeting_link
                )

                # ✅ Notify patient
                send_email_notification(
                    to_email=appointment.patient.email,
                    subject="Your Consultation Link",
                    message=f"Dear {appointment.patient.username},\n\n"
                            f"Your consultation is confirmed.\nJoin here: {meeting_link}"
                )

                if hasattr(appointment.patient, "profile") and appointment.patient.profile.phone:
                    send_sms_notification(
                        to_number=appointment.patient.profile.phone,
                        message=f"Your consultation is confirmed. Join here: {meeting_link}"
                    )

                consultation.notified = True
                consultation.save()

        return JsonResponse({"status": "ok"})

    return JsonResponse({"error": "Invalid request"}, status=400)