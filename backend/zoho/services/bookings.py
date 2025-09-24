import requests
from datetime import datetime, timedelta
from zoho.services.auth import get_access_token

ZOHO_BOOKINGS_BASE_URL = "https://www.zohoapis.in/bookings/v1/json"

def create_booking(appointment):
    """
    Create a booking in Zoho Bookings (matches the cURL form-data request).
    """
    url = f"{ZOHO_BOOKINGS_BASE_URL}/appointment"  # endpoint must be plural

    headers = {
        "Authorization": f"Zoho-oauthtoken {get_access_token()}"
    }

    session_duration = appointment.session_plan.duration_minutes 
    amount_paid = appointment.session_plan.price
    zoho_service_id=appointment.session_plan.zoho_service_id
    zoho_staff_id=appointment.doctor.zoho_staff_id
    # Combine date + time
    dt = datetime.combine(appointment.date, appointment.time)

            # Format Zoho expects: dd-MMM-yyyy HH:mm:ss
    from_time = dt.strftime("%d-%b-%Y %H:%M:%S")
    to_time = (dt + timedelta(minutes=session_duration, seconds=1)).strftime("%d-%b-%Y %H:%M:%S") 

    # Payload for form-data (must send JSON strings for customer_details and payment_info)
    payload = {
        "service_id": zoho_service_id,
        "staff_id": zoho_staff_id,
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
            "cost_paid": amount_paid,
            "currency": "INR"
        }).replace("'", '"')
    }

    response = requests.post(url, headers=headers, data=payload)
    response.raise_for_status()
    return response.json()

def fetch_appointments(payload):
    url =f"{ZOHO_BOOKINGS_BASE_URL}/fetchappointment"
    response = requests.post(
            url,
            headers={"Authorization": f"Zoho-oauthtoken {get_access_token()}"},
            data=payload
        )

    response.raise_for_status()
    return response.json()