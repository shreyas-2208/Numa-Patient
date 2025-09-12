import requests
from django.conf import settings
from decouple import config

ZOHO_BOOKINGS_BASE_URL = "https://www.zohoapis.in/bookings/v1"
ZOHO_ACCESS_TOKEN = config("ZOHO_ACCESS_TOKEN") # Store this in settings or DB

def create_booking(appointment):
    """
    Create booking in Zoho Bookings after successful payment.
    """
    url = f"{ZOHO_BOOKINGS_BASE_URL}/appointments"

    headers = {
        "Authorization": f"Zoho-oauthtoken {ZOHO_ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }

    payload = {
        "service_id": 330945000000041052,   # from Zoho Bookings setup
        "staff_id": "330945000000041014",   # map to doctor if needed
        "customer": {
            "name": appointment.patient.username,
            "email": appointment.patient.email,
            "phone_number": appointment.patient.profile.phone if hasattr(appointment.patient, "profile") else ""
        },
        "start_time": str(appointment.slot.start_time),  # ensure ISO 8601
        "end_time": str(appointment.slot.end_time),
        "notes": f"Appointment ID: {appointment.id}",
        # can add more fields as needed (meeting link, reminders, etc.)
    }

    response = requests.post(url, headers=headers, json=payload)
    response.raise_for_status()
    return response.json()
