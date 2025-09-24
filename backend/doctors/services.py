from django.db import transaction
from django.utils import timezone
from .models import Doctor
from django.db.models.functions import Coalesce
from datetime import datetime, timedelta, time
from collections import defaultdict
from django.utils import timezone
from appointments.models import Appointment
from doctors.models import Doctor
from dateutil import parser
from django.utils import timezone
from zoho.services.bookings import fetch_appointments 

BUFFER_MINUTES = 10  # buffer between sessions

def assigned_doctor_by_specialization(specialization: str):
    """
    Assigns a doctor for the given specialization using round robin.
    Ensures atomicity so two patients don’t get the same doctor at the same time.
    """

    with transaction.atomic():
        doctors = (
            Doctor.objects
            .select_for_update(skip_locked=True)
            .filter(specialization=specialization)
            .annotate(
        # Replace NULL with a very old timestamp for sorting
            safe_last=Coalesce("last_assigned", timezone.datetime(1970, 4, 8))
            )
            .order_by("safe_last", "id")
        )

        if not doctors.exists():
            return None

        doctor = doctors.first()
        doctor.last_assigned = timezone.now()
        doctor.save(update_fields=["last_assigned"])
        return doctor
    

def get_doctor_available_slots(doctor, plan_duration: int):
    """
    Returns available slots for a doctor for the next 2 weeks based on plan_duration (in minutes).
    Considers:
    - Doctor's Zoho booked appointments
    - DB scheduled appointments
    - 10 min buffer between sessions
    All datetimes are converted to current timezone (IST) for consistency.
    """
    slots_by_date = defaultdict(list)
    now = timezone.localtime()  # current IST
    end_date = now + timedelta(days=14)

    # --- Step 1: Fetch doctor's appointments from DB ---
    db_appointments = Appointment.objects.filter(
        doctor=doctor,
        date__range=(now.date(), end_date.date()),
        status__in=["approved", "scheduled", "completed"]
    ).values("date", "time", "session_plan__duration_minutes")

    # --- Step 2: Fetch Zoho booked appointments ---
    zoho_payload = {
        "staff_id": doctor.zoho_staff_id,
        "from": now.strftime("%Y-%m-%dT%H:%M:%S"),
        "to": end_date.strftime("%Y-%m-%dT%H:%M:%S")
    }
    zoho_response = fetch_appointments(zoho_payload)

    zoho_appointments = []
    for appt in zoho_response.get("appointments", []):
        start = parser.isoparse(appt["iso_start_time"])  # aware UTC
        end = parser.isoparse(appt["iso_end_time"])      # aware UTC
        # convert to current timezone (IST)
        start = timezone.localtime(start, timezone.get_current_timezone())
        end = timezone.localtime(end, timezone.get_current_timezone())
        zoho_appointments.append({"start": start, "end": end})

    # --- Step 3: Build unavailable times ---
    unavailable_times = defaultdict(list)

    # DB appointments
    for appt in db_appointments:
        appt_start = datetime.combine(appt["date"], appt["time"])
        appt_start = timezone.make_aware(appt_start, timezone.get_current_timezone())
        duration = appt.get("session_plan__duration_minutes") or plan_duration
        appt_end = appt_start + timedelta(minutes=duration + BUFFER_MINUTES)
        unavailable_times[appt["date"]].append((appt_start, appt_end))

    # Zoho appointments
    for appt in zoho_appointments:
        date = appt["start"].date()
        unavailable_times[date].append((appt["start"], appt["end"]))

    # --- Step 4: Generate potential slots ---
    work_start = time(9, 0)
    work_end = time(18, 0)
    current_day = now.date()

    while current_day <= end_date.date():
        day_start = datetime.combine(current_day, work_start)
        day_end = datetime.combine(current_day, work_end)
        # make aware
        day_start = timezone.make_aware(day_start, timezone.get_current_timezone())
        day_end = timezone.make_aware(day_end, timezone.get_current_timezone())
        slot_start = max(day_start, now)

        while slot_start + timedelta(minutes=plan_duration) <= day_end:
            slot_end = slot_start + timedelta(minutes=plan_duration)

            # Check overlap with unavailable times
            overlap = False
            for u_start, u_end in unavailable_times.get(current_day, []):
                if slot_start < u_end and slot_end > u_start:
                    overlap = True
                    break

            if not overlap:
                slots_by_date[current_day].append({
                    "start": slot_start,
                    "end": slot_end
                })

            # move to next potential slot
            slot_start = slot_end + timedelta(minutes=BUFFER_MINUTES)

        current_day += timedelta(days=1)

    return dict(slots_by_date)