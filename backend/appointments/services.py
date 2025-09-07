# appointments/services.py
from doctors.models import Doctor
from datetime import datetime, timedelta
import requests
from decouple import config
from .models import Appointment

ZOHO_API_URL = "https://calendar.zoho.com/api/v1/calendars/{calendar_id}/events"
ZOHO_ACCESS_TOKEN = config("ZOHO_ACCESS_TOKEN")

def assign_doctor(specialization, date, time):
    """
    Assign a doctor for a given specialization, date, and time.
    """
    doctors = Doctor.objects.filter(specialization=specialization)

    for doctor in doctors:
        # Check if time is within doctor's working hours
        if not (doctor.available_from <= time <= doctor.available_to):
            continue

        # Check for conflicting appointments in Django DB
        conflict = Appointment.objects.filter(doctor=doctor, date=date, time=time).exists()
        if conflict:
            continue

        return doctor

    return None  


def get_free_slots(calendar_id, specialization, days_ahead=3, available_from="09:00", available_to="17:00"):
    """
    Returns available slots for the next `days_ahead` days for doctors of a given specialization.
    """
    headers = {"Authorization": f"Zoho-oauthtoken {ZOHO_ACCESS_TOKEN}"}
    today = datetime.today().date()
    all_slots = {}

    for day_offset in range(days_ahead):
        date = today + timedelta(days=day_offset)
        date_str = date.strftime("%Y-%m-%d")

        # Get events from Zoho Calendar
        params = {"fromDate": date_str, "toDate": date_str}
        resp = requests.get(ZOHO_API_URL.format(calendar_id=calendar_id), headers=headers, params=params)
        events = resp.json().get("events", [])

        # Calculate free slots
        start_time = datetime.strptime(f"{date_str} {available_from}", "%Y-%m-%d %H:%M")
        end_time = datetime.strptime(f"{date_str} {available_to}", "%Y-%m-%d %H:%M")
        slots = []

        current = start_time
        while current + timedelta(hours=1) <= end_time:
            slot_end = current + timedelta(hours=1)
            overlap = False

            # Check for overlaps with existing Zoho events
            for e in events:
                e_start = datetime.fromisoformat(e["start"]["dateTime"])
                e_end = datetime.fromisoformat(e["end"]["dateTime"])
                if not (slot_end <= e_start or current >= e_end):
                    overlap = True
                    break

            # Check for overlaps with appointments in Django DB
            for doctor in Doctor.objects.filter(specialization=specialization):
                conflict = Appointment.objects.filter(
                    doctor=doctor, date=date, time=current.time()
                ).exists()
                if conflict:
                    overlap = True
                    break

            if not overlap:
                slots.append(current.strftime("%H:%M"))

            current += timedelta(hours=1)

        all_slots[date_str] = slots

    return all_slots
