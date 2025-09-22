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

    session_duration = appointment.session_plan.duration_minutes if appointment.session_plan else 60
    # Combine date + time
    dt = datetime.combine(appointment.date, appointment.time)

            # Format Zoho expects: dd-MMM-yyyy HH:mm:ss
    from_time = dt.strftime("%d-%b-%Y %H:%M:%S")
    to_time = (dt + timedelta(minutes=session_duration, seconds=1)).strftime("%d-%b-%Y %H:%M:%S") 

    # Payload for form-data (must send JSON strings for customer_details and payment_info)
    payload = {
        "service_id": "330945000000041052",
        "staff_id": "330945000000041014",
        "from_time": from_time,
        "to_time": to_time,
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

