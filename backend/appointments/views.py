# appointments/views.py
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Appointment
from .serializers import AppointmentSerializer
from .services import assign_doctor

from payments.models import Payment
from payments.services import create_payment_link
from notifications.services import send_email_notification, send_sms_notification


# -------------------------------
# Book Appointment (with Payment)
# -------------------------------
class AppointmentCreateView(generics.CreateAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        specialization = self.request.data.get("specialization")
        date = self.request.data.get("date")
        time = self.request.data.get("time")

        # Assign doctor (optional at this stage, or later after payment)
        doctor = assign_doctor(specialization, date, time)

        # Create appointment in DB
        appointment = serializer.save(
            patient=self.request.user,
            doctor=doctor,
            status="pending_payment"
        )

        # Create payment link via Zoho
        payment_url = create_payment_link(
            user=self.request.user,
            appointment=appointment,
            amount=500  # Example: ₹500 consultation fee
        )

        # Notify patient to complete payment
        msg = f"Dear {self.request.user.username}, your appointment on {date} at {time} is created. Please complete the payment to confirm."
        send_email_notification(self.request.user, "Complete Your Payment", msg)
        send_sms_notification(self.request.user, msg)

        return payment_url

    def create(self, request, *args, **kwargs):
        """
        Override to return payment link in response
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payment_url = self.perform_create(serializer)

        headers = self.get_success_headers(serializer.data)
        return Response(
            {
                "appointment": serializer.data,
                "payment_url": payment_url
            },
            status=status.HTTP_201_CREATED,
            headers=headers,
        )


# -------------------------------
# List Appointments for Patient
# -------------------------------
class AppointmentListView(generics.ListAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Appointment.objects.filter(patient=self.request.user)


# -------------------------------
# Update/Cancel Appointment
# -------------------------------
class AppointmentUpdateView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Appointment.objects.filter(patient=self.request.user)
