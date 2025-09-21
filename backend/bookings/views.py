# backend/bookings/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from appointments.models import Appointment
from zoho.services.bookings import create_booking  # your helper function

class CreateZohoBookingView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        appointment_id = request.data.get("appointment_id")
        if not appointment_id:
            return Response({"error": "appointment_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        appointment = get_object_or_404(Appointment, id=appointment_id, patient=request.user)

        try:
            booking_response = create_booking(appointment)
            booking_response_data = booking_response.get("response",{}).get("returnvalue",{})

            appointment.zoho_booking_id = booking_response_data.get("booking_id")
            appointment.zoho_meeting_link = booking_response_data.get("meeting_info", {}).get("join_link")
            # appointment.status = "scheduled"
            # appointment.save()

            return Response({"zoho_response": booking_response}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class GetZohoBookingsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Placeholder for fetching bookings from Zoho

        
        return Response({"message": "Fetch bookings from Zoho - Not Implemented"}, status=status.HTTP_200_OK)
