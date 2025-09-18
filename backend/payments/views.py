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
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import razorpay
from django.conf import settings

razorpay_client = razorpay.Client(
    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
)

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


class CreateOrderForAppointmentView(APIView):
    def post(self, request, appointment_id):
        try:
            appointment = Appointment.objects.get(id=appointment_id, patient=request.user)
        except Appointment.DoesNotExist:
            return Response({"error": "Appointment not found"}, status=status.HTTP_404_NOT_FOUND)

        # Get amount and validate it
        amount = request.data.get("amount")
        if not amount:
            return Response({"error": "Amount is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Convert to float first, then to int to handle decimal amounts
        try:
            amount_float = float(amount)
            if amount_float <= 0:
                return Response({"error": "Amount must be greater than 0"}, status=status.HTTP_400_BAD_REQUEST)
        except (ValueError, TypeError):
            return Response({"error": "Invalid amount format"}, status=status.HTTP_400_BAD_REQUEST)
        
        currency = "INR"

        # Create Razorpay order with amount in paise (multiply by 100)
        order = razorpay_client.order.create({
            "amount": int(amount_float * 100), 
            "currency": currency,
            "payment_capture": 1
        })

        payment = Payment.objects.create(
            user=request.user,
            appointment=appointment,
            amount=amount_float,  # Store the original amount
            currency=currency,
            status="initiated",
            razorpay_order_id=order["id"]
        )

        return Response({
            "order_id": order["id"],
            "amount": amount_float,
            "currency": currency,
            "payment_id": payment.id,
            "razorpay_key": settings.RAZORPAY_KEY_ID
        }, status=status.HTTP_201_CREATED)


class VerifyPaymentView(APIView):
    def post(self, request):
        razorpay_order_id = request.data.get("razorpay_order_id")
        razorpay_payment_id = request.data.get("razorpay_payment_id")
        razorpay_signature = request.data.get("razorpay_signature")

        try:
            payment = Payment.objects.get(razorpay_order_id=razorpay_order_id, user=request.user)
        except Payment.DoesNotExist:
            return Response({"error": "Payment not found"}, status=status.HTTP_404_NOT_FOUND)

        # Verify Razorpay signature
        try:
            razorpay_client.utility.verify_payment_signature({
                "razorpay_order_id": razorpay_order_id,
                "razorpay_payment_id": razorpay_payment_id,
                "razorpay_signature": razorpay_signature
            })
        except:
            payment.status = "failed"
            payment.save()
            return Response({"error": "Signature verification failed"}, status=status.HTTP_400_BAD_REQUEST)

        # Mark payment as successful
        payment.status = "successful"
        payment.razorpay_payment_id = razorpay_payment_id
        payment.razorpay_signature = razorpay_signature
        payment.save()

        # Update appointment
        appointment = payment.appointment
        appointment.status = "scheduled"
        appointment.save()

        return Response({"success": True, "message": "Payment verified and appointment confirmed"})


class CancelPaymentView(APIView):
    def post(self, request, appointment_id):
        try:
            appointment = Appointment.objects.get(id=appointment_id, patient=request.user)
        except Appointment.DoesNotExist:
            return Response({"error": "Appointment not found"}, status=status.HTTP_404_NOT_FOUND)

        # Update appointment status to cancelled
        appointment.status = "cancelled"
        appointment.save()

        # Update payment status if exists
        try:
            payment = Payment.objects.get(appointment=appointment, user=request.user)
            payment.status = "cancelled"
            payment.save()
        except Payment.DoesNotExist:
            pass  # No payment record exists yet

        return Response({
            "success": True, 
            "message": "Payment cancelled and appointment status updated"
        })
