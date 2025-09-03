# appointments/services.py
from doctors.models import Doctor
from .models import Appointment

def assign_doctor(specialization, date, time):
    doctors = Doctor.objects.filter(specialization=specialization)

    for doctor in doctors:
        if not (doctor.available_from <= time <= doctor.available_to):
            continue

        conflict = Appointment.objects.filter(doctor=doctor, date=date, time=time).exists()
        if conflict:
            continue

        return doctor

    return None  

import requests
from datetime import datetime, timedelta

ZOHO_API_URL = "https://calendar.zoho.com/api/v1/calendars/{calendar_id}/events"
ZOHO_ACCESS_TOKEN = "<doctor-zoho-access-token>"

def get_free_slots(calendar_id, date, available_from="09:00", available_to="17:00"):
    headers = {"Authorization": f"Zoho-oauthtoken {ZOHO_ACCESS_TOKEN}"}
    params = {"fromDate": date, "toDate": date}

    resp = requests.get(ZOHO_API_URL.format(calendar_id=calendar_id), headers=headers, params=params)
    events = resp.json().get("events", [])

    start_time = datetime.strptime(f"{date} {available_from}", "%Y-%m-%d %H:%M")
    end_time = datetime.strptime(f"{date} {available_to}", "%Y-%m-%d %H:%M")

    slots = []
    current = start_time
    while current + timedelta(hours=1) <= end_time:
        slot_end = current + timedelta(hours=1)
        overlap = False
        for e in events:
            e_start = datetime.fromisoformat(e["start"]["dateTime"])
            e_end = datetime.fromisoformat(e["end"]["dateTime"])
            if not (slot_end <= e_start or current >= e_end):
                overlap = True
                break
        if not overlap:
            slots.append(current.strftime("%H:%M"))
        current += timedelta(hours=1)
    return slots
