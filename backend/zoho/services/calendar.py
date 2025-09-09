from datetime import datetime, timedelta
import requests
from zoho.services.auth import get_access_token

BASE_URL = "http://calendar.zoho.in/api/v1"

def get_calendars():
    """
    Get all calendars of the authenticated user.
    """
    token = get_access_token()
    headers = {"Authorization": f"Zoho-oauthtoken {token}"}
    resp = requests.get(f"{BASE_URL}/calendars", headers=headers)
    resp.raise_for_status()
    return resp.json().get("calendars", [])

def get_events(calendar_id, from_date=None, to_date=None):
    """
    Get events from a calendar between from_date and to_date.
    Dates in 'YYYY-MM-DD' format.
    """
    token = get_access_token()
    headers = {"Authorization": f"Zoho-oauthtoken {token}"}

    if not from_date:
        from_date = datetime.now().strftime("%Y-%m-%d")
    if not to_date:
        to_date = (datetime.now() + timedelta(days=14)).strftime("%Y-%m-%d")

    params = {"fromDate": from_date, "toDate": to_date}
    resp = requests.get(f"{BASE_URL}/calendars/{calendar_id}/events", headers=headers )
    # todo: add params=params back
    resp.raise_for_status()
    return resp.json().get("events", [])

def get_free_slots(calendar_id, date, available_from="09:00", available_to="17:00", slot_duration=90):
    """
    Returns available slots for a given calendar and date.
    - date: YYYY-MM-DD
    - available_from, available_to: string "HH:MM"
    - slot_duration: in minutes
    """
    token = get_access_token()
    headers = {"Authorization": f"Zoho-oauthtoken {token}"}

    # Get events for the date
    events = get_events(calendar_id, from_date=date, to_date=date)

    start_time = datetime.strptime(f"{date} {available_from}", "%Y-%m-%d %H:%M")
    end_time = datetime.strptime(f"{date} {available_to}", "%Y-%m-%d %H:%M")

    slots = []
    current = start_time
    while current + timedelta(minutes=slot_duration) <= end_time:
        slot_end = current + timedelta(minutes=slot_duration)
        # Check for overlap with existing events
        overlap = False
        for e in events:
            e_start = datetime.fromisoformat(e["start"]["dateTime"])
            e_end = datetime.fromisoformat(e["end"]["dateTime"])
            if not (slot_end <= e_start or current >= e_end):
                overlap = True
                break
        if not overlap:
            slots.append({
                "start": current.strftime("%H:%M"),
                "end": slot_end.strftime("%H:%M")
            })
        current += timedelta(minutes=slot_duration)

    return slots