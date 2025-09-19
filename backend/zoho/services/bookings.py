import requests
from datetime import datetime, timedelta
from zoho.services.auth import get_access_token

ZOHO_BOOKINGS_BASE_URL = "https://www.zohoapis.in/bookings/v1/json"
ZOHO_ACCESS_TOKEN = get_access_token()

def create_booking(appointment):
    """
    Create a booking in Zoho Bookings (matches the cURL form-data request).
    """
    url = f"{ZOHO_BOOKINGS_BASE_URL}/appointment"  # endpoint must be plural

    headers = {
        "Authorization": f"Zoho-oauthtoken {ZOHO_ACCESS_TOKEN}"
    }

    # Combine date + time
    start_datetime = datetime.combine(appointment.date, appointment.time)
    end_datetime = start_datetime + timedelta(minutes=90)  # service duration

    # Format for Zoho API
    from_time = start_datetime.strftime("%d-%b-%Y %H:%M:%S")
    to_time = end_datetime.strftime("%d-%b-%Y %H:%M:%S")

    # Payload for form-data (must send JSON strings for customer_details and payment_info)
    payload = {
        "service_id": "330945000000041052",
        "staff_id": "330945000000041014",
        "from_time": "20-Sep-2025 12:30:00",
        "to_time": "20-Sep-2025 14:00:00",
        "timezone": "Asia/Kolkata",
        "customer_details": str({
            "name": appointment.patient.username,
            "email": appointment.patient.email,
            "phone_number": appointment.patient.profile.phone_number if hasattr(appointment.patient, "profile") else ""
        }).replace("'", '"'),
        "notes": f"Appointment ID: {appointment.id}",
        "payment_info": str({
            "cost_paid": "0.00",
            "currency": "INR"
        }).replace("'", '"')
    }

    # Use files=payload for form-data
    response = requests.post(url, headers=headers, data=payload)
    response.raise_for_status()
    return response.json()
