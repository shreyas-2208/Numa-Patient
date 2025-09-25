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
from zoho.services.calendar import get_free_slots_for_range

from collections import defaultdict
from datetime import datetime, timedelta
from dateutil import parser
from django.utils import timezone
import pytz

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
    

def get_doctor_available_slotsv0(doctor, plan_duration: int):
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

def format_12hr(dt):
    """Format datetime to 12hr time string."""
    return dt.strftime("%I:%M %p")

def chunk_slots(start_dt, end_dt, duration, buffer=10):
    """
    Split an event block into slots of given duration (mins).
    Adds buffer minutes between slots.
    """
    slots = []
    slot_start = start_dt
    while slot_start + timedelta(minutes=duration) <= end_dt:
        slot_end = slot_start + timedelta(minutes=duration)
        slots.append({"start": slot_start, "end": slot_end})
        slot_start = slot_end + timedelta(minutes=buffer)
    return slots

def get_doctor_available_slots(doctor, plan_duration: int):
    """
    Returns free slots for a doctor for the next 2 weeks.
    Steps:
    1. Fetch available event ranges from Zoho calendar (doctor.calendarId).
    2. Split them into chunks (plan_duration).
    3. Fetch doctor's Zoho booked appointments (staff_id).
    4. Filter out overlapping slots.
    5. Return freeSlots grouped by date in 12hr format.
    """
    # now = timezone.localtime()
    IST = pytz.timezone("Asia/Kolkata")
    now = datetime.now(IST)
    end_date = now + timedelta(days=14)

    print(now, end_date)

    # --- Step 1: Get free event slots from Zoho Calendar ---
    raw_slots_by_date = get_free_slots_for_range(
        doctor.zoho_calendar_id,
        start_date=now.strftime("%Y-%m-%d"),
        days=14
    )

    # available_slots = defaultdict(list)
    # for date_str, events in raw_slots_by_date.items():
    #     for e in events:
    #         e_start = datetime.combine(
    #             datetime.strptime(date_str, "%Y-%m-%d").date(),
    #             datetime.strptime(e["start"], "%H:%M").time()
    #         )
    #         e_end = datetime.combine(
    #             datetime.strptime(date_str, "%Y-%m-%d").date(),
    #             datetime.strptime(e["end"], "%H:%M").time()
    #         )

    #         # make timezone-aware (IST)
    #         e_start = timezone.make_aware(e_start, timezone.get_current_timezone())
    #         e_end = timezone.make_aware(e_end, timezone.get_current_timezone())

    #         # break into chunks
    #         chunks = chunk_slots(e_start, e_end, plan_duration)
    #         print("chunks", date_str, e, chunks)
    #         valid_chunks = [slot for slot in chunks if slot["start"] >= now]

    #         available_slots[date_str].extend(chunks)

    available_slots = defaultdict(list)
    for date_str, events in raw_slots_by_date.items():
        date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
        
        for e in events:
            e_start = datetime.combine(date_obj, datetime.strptime(e["start"], "%H:%M").time())
            e_end = datetime.combine(date_obj, datetime.strptime(e["end"], "%H:%M").time())

            # make timezone-aware in IST
            e_start = IST.localize(e_start)
            e_end = IST.localize(e_end)

            # break into chunks
            chunks = chunk_slots(e_start, e_end, plan_duration)

            # Filter chunks based on now
            valid_chunks = []
            for slot in chunks:
                slot_start = slot["start"].astimezone(IST)
                slot_end = slot["end"].astimezone(IST)
                
                # keep slot if it's in future (today) or any slot on future date
                if date_obj > now.date() or (date_obj == now.date() and slot_start >= now):
                    valid_chunks.append({"start": slot_start, "end": slot_end})

            available_slots[date_str].extend(valid_chunks)

    # --- Step 2: Fetch Zoho booked appointments ---
    zoho_payload = {
        "staff_id": doctor.zoho_staff_id,
        "from": now.strftime("%Y-%m-%dT%H:%M:%S"),
        "to": end_date.strftime("%Y-%m-%dT%H:%M:%S"),
    }
    zoho_response = fetch_appointments(zoho_payload)

    booked_slots = []
    for appt in zoho_response.get("appointments", []):
        start = parser.isoparse(appt["iso_start_time"])
        end = parser.isoparse(appt["iso_end_time"])
        start = timezone.localtime(start, timezone.get_current_timezone())
        end = timezone.localtime(end, timezone.get_current_timezone())
        booked_slots.append({"start": start, "end": end})

    # --- Step 3: Filter available slots ---
    free_slots = defaultdict(list)
    for date_str, slots in available_slots.items():
        valid_slots = []
        for slot in slots:
            slot_start, slot_end = slot["start"], slot["end"]
            overlap = False
            for booked in booked_slots:
                if slot_start < booked["end"] and slot_end > booked["start"]:
                    overlap = True
                    break
            if not overlap:
                valid_slots.append({
                    "start": format_12hr(slot_start),
                    "end": format_12hr(slot_end)
                })
        
        # Sort the slots by start time
        valid_slots.sort(key=lambda x: datetime.strptime(x["start"], "%I:%M %p"))
        free_slots[date_str].extend(valid_slots)

    return dict(free_slots)
