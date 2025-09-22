# backend/bookings/views.py
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from datetime import datetime, timedelta
import requests
import json
from appointments.models import Appointment
from zoho.services.bookings import create_booking  # your helper function
from django.conf import settings
from zoho.services.auth import get_access_token

class CreateZohoBookingView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        appointment_id = request.data.get("appointment_id")
        if not appointment_id:
            return Response({"error": "appointment_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        appointment = get_object_or_404(Appointment, id=appointment_id, patient=request.user)

        try:
            booking_response = create_booking(appointment)
            booking_response_data = booking_response.get("response", {}).get("returnvalue", {})

            if not booking_response_data:
                return Response({"error": "Failed to create booking in Zoho"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            appointment.zoho_booking_id = booking_response_data.get("booking_id")
            appointment.zoho_meeting_link = booking_response_data.get("meeting_info", {}).get("join_link")
            appointment.status = "scheduled"
            appointment.save()

            return Response({"zoho_response": booking_response}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class GetZohoBookingsView(APIView):
#     permission_classes = [permissions.IsAuthenticated]

#     def get(self, request, *args, **kwargs):
#         """
#         Fetch all Zoho bookings for the authenticated patient, including follow-ups booked by the doctor.
#         """
#         appointments = Appointment.objects.filter(patient=request.user).order_by("date", "time")
#         results = []

#         for appt in appointments:
#             try:
#                 dt_start = datetime.combine(appt.date, appt.time)
#                 dt_end = dt_start + timedelta(days=30)  # fetch follow-ups for next 30 days

#                 data_dict = {
#                     "customer_email": request.user.email,
#                     "from_time": dt_start.strftime("%d-%b-%Y %H:%M:%S"),
#                     "to_time": dt_end.strftime("%d-%b-%Y %H:%M:%S"),
#                     "need_customer_more_info": "true"
#                 }

#                 if appt.zoho_booking_id:
#                     data_dict["booking_id"] = appt.zoho_booking_id

#                 response = requests.post(
#                     "https://www.zohoapis.in/bookings/v1/json/fetchappointment",
#                     headers={"Authorization": f"Zoho-oauthtoken {get_access_token()}"},
#                     files={"data": json.dumps(data_dict)}
#                 )

#                 resp_json = response.json()
#                 if resp_json.get("response", {}).get("status") == "success":
#                     returnvalue = resp_json["response"].get("returnvalue", [])
#                     if isinstance(returnvalue, dict):
#                         returnvalue = [returnvalue]

#                     for booking in returnvalue:
#                         results.append({
#                             "appointment_id": appt.id,
#                             "zoho_booking_id": booking.get("booking_id"),
#                             "date": booking.get("start_time"),
#                             "duration": booking.get("duration"),
#                             "status": booking.get("status"),
#                             "meeting_link": booking.get("meeting_info", {}).get("join_link"),
#                             "start_link": booking.get("meeting_info", {}).get("start_link"),
#                             "service_name": booking.get("service_name"),
#                             "notes": booking.get("notes"),
#                         })

#             except Exception as e:
#                 results.append({"error": str(e), "appointment_id": appt.id})

#         return Response({"zoho_bookings": results}, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def fetch_followup_appointments(request):
    """
    Fetch follow-up appointments from Zoho Bookings for a specific appointment.
    """
    appointment_id = request.data.get("appointment_id")
    if not appointment_id:
        return Response({"error": "Missing 'appointment_id' in request body"}, status=400)

    try:
        appointment = Appointment.objects.get(id=appointment_id)
        dt = datetime.combine(appointment.date, appointment.time)

        from_time = dt.strftime("%d-%b-%Y %H:%M:%S")
        to_time = (dt + timedelta(days=15)).strftime("%d-%b-%Y %H:%M:%S")  # fetch next 15 days

        data_dict = {
            "customer_email": "nidhip03@gmail.com",
            "from_time": from_time,
            "to_time": to_time
        }

        payload = {
            "data": json.dumps(data_dict)
        }
        resp = requests.post(
            "https://www.zohoapis.in/bookings/v1/json/fetchappointment",
            headers={"Authorization": f"Zoho-oauthtoken {get_access_token()}"},
            data=payload
        )

        return Response(resp.json(), status=resp.status_code)

    except Appointment.DoesNotExist:
        return Response({"error": "Appointment not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)
    
class RescheduleZohoBookingView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        """
        Reschedule an existing Zoho booking for the logged-in patient.
        """
        appointment_id = request.data.get("appointment_id")
        new_date = request.data.get("date")   # "2025-09-30"
        new_time = request.data.get("time")   # "14:00:00"

        if not appointment_id or not new_date or not new_time:
            return Response(
                {"error": "appointment_id, date, and time are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        appointment = get_object_or_404(Appointment, id=appointment_id, patient=request.user)

        if not appointment.zoho_booking_id:
            return Response(
                {"error": "No Zoho booking ID found for this appointment"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # Build datetime string for Zoho
            dt = datetime.strptime(f"{new_date} {new_time}", "%Y-%m-%d %H:%M:%S")
            from_time = dt.strftime("%d-%b-%Y %H:%M:%S")

            data_dict = {
                "booking_id": appointment.zoho_booking_id,
                "customer_email": request.user.email,
                "reschedule_time": from_time,
            }

            resp = requests.post(
                "https://www.zohoapis.in/bookings/v1/json/rescheduleappointment",
                headers={"Authorization": f"Zoho-oauthtoken {get_access_token()}"},
                files={"data": json.dumps(data_dict)},
            )

            resp_json = resp.json()

            if resp_json.get("response", {}).get("status") != "success":
                return Response(
                    {"error": "Failed to reschedule in Zoho", "details": resp_json},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Update appointment in DB
            appointment.date = new_date
            appointment.time = new_time
            appointment.status = "rescheduled"
            appointment.save()

            return Response({"zoho_response": resp_json}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
