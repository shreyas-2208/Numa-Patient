import requests

ZOHO_MEETING_API = "https://meeting.zoho.com/api/v2/meetings"
ZOHO_ACCESS_TOKEN = "your_zoho_access_token"  # from OAuth

def create_meeting(appointment):
    payload = {
        "topic": f"Consultation with Dr. {appointment.doctor.user.username}",
        "agenda": "Patient Consultation",
        "startTime": f"{appointment.date}T{appointment.time}:00Z",  # ISO format
        "duration": 30,
    }

    headers = {
        "Authorization": f"Zoho-oauthtoken {ZOHO_ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }

    response = requests.post(ZOHO_MEETING_API, json=payload, headers=headers)
    response.raise_for_status()

    data = response.json()
    return data.get("joinUrl")  # Zoho Meeting join link
