# appointments/views.py
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Appointment
from .serializers import AppointmentSerializer
from plans.models import SessionPlan, PackagePlan
from payments.models import Payment
from rest_framework.views import APIView
from datetime import datetime, timedelta


class AppointmentCreateView(generics.CreateAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Save appointment with pending status
        user = self.request.user
        date = self.request.data.get("date")
        time = self.request.data.get("time")
        doctor = user.profile.assigned_doctor
        plan_id = self.request.data.get("plan_id")
        plan = get_object_or_404(SessionPlan, id=plan_id) if plan_id else None

         # Create appointment in DB
        appointment = serializer.save(
            patient=user,
            doctor=doctor,  
            date=date,
            time=time,
            session_plan=plan,
            status="pending"
        )
        return appointment

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        appointment = self.perform_create(serializer)

        appointment_data = self.get_serializer(appointment).data

        return Response(
            {
                # "id": appointment.id,
                "appointment": appointment_data
            },
            status=status.HTTP_201_CREATED
        )

class AppointmentListView(generics.ListAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        statuses = self.request.query_params.getlist("status")

        appointments = Appointment.objects.filter(patient=user).order_by("-date", "-time")

        if statuses:
            appointments = appointments.filter(status__in=statuses)

        return appointments



# -------------------------------
# Update/Cancel Appointment
# -------------------------------
class AppointmentUpdateView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Appointment.objects.filter(patient=self.request.user)
    
class AppointmentRescheduleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        """
        Reschedule an appointment by updating date & time.
        """
        user = request.user
        appointment = get_object_or_404(Appointment, id=pk, patient=user)

        new_date = request.data.get("date")
        new_time = request.data.get("time")

        if not new_date or not new_time:
            return Response(
                {"error": "Both 'date' and 'time' are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Update appointment
        appointment.date = new_date
        appointment.time = new_time
        appointment.status = "rescheduled"
        appointment.save()

        # Serialize updated appointment
        data = AppointmentSerializer(appointment).data

        # Optional: send notifications
        # send_email_notification(user.email, "Your appointment has been rescheduled.")
        # send_sms_notification(user.profile.phone_number, "Your appointment has been rescheduled.")

        return Response({"appointment": data}, status=status.HTTP_200_OK)
