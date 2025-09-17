from datetime import datetime, timedelta, timezone
import requests
from zoho.services.auth import get_access_token
import json

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

# def get_events(calendar_id, from_date=None, to_date=None):
#     """
#     Get events from a calendar between from_date and to_date.
#     Dates in 'YYYY-MM-DD' format.
#     """
#     token = get_access_token()
#     headers = {"Authorization": f"Zoho-oauthtoken {token}"}

#     if not from_date:
#         from_date = datetime.now().strftime("%Y-%m-%d")
#     if not to_date:
#         to_date = (datetime.now() + timedelta(days=14)).strftime("%Y-%m-%d")

#     params = {"fromDate": from_date, "toDate": to_date}
#     resp = requests.get(f"{BASE_URL}/calendars/{calendar_id}/events", headers=headers )
#     # todo: add params=params back
#     resp.raise_for_status()
#     return resp.json().get("events", [])

def get_events_for_range(calendar_id, from_date=None, to_date=None):
    """
    Get events from a calendar between from_date and to_date.
    Dates in 'YYYY-MM-DD' format.
    Uses Zoho Calendar 'range' parameter (max 31 days).
    """
    token = get_access_token()
    headers = {
        "Authorization": f"Zoho-oauthtoken {token}",
        "Accept": "application/json+large",
    }

    # Defaults: today → +14 days
    if not from_date:
        from_date = datetime.utcnow()
    else:
        from_date = datetime.strptime(from_date, "%Y-%m-%d")

    if not to_date:
        to_date = datetime.utcnow() + timedelta(days=14)
    else:
        to_date = datetime.strptime(to_date, "%Y-%m-%d")

    # Format according to Zoho spec (yyyyMMdd)
    start_str = from_date.strftime("%Y%m%d")
    end_str = to_date.strftime("%Y%m%d")

    # Zoho expects range as a JSON string inside query params
    params = {
        "range": json.dumps({
            "start": start_str,
            "end": end_str,
        })
    }

    resp = requests.get(
        f"{BASE_URL}/calendars/{calendar_id}/events",
        headers=headers,
        params=params
    )
    resp.raise_for_status()
    return resp.json().get("events", [])

def parse_zoho_datetime(dt_str: str) -> datetime:
    """
    Parse Zoho datetime string like '20250908T123000+0530'
    """
    return datetime.strptime(dt_str, "%Y%m%dT%H%M%S%z").replace(tzinfo=None)

# def get_free_slots_for_two_weeks(calendar_id, date, available_from="09:00", available_to="17:00", slot_duration=90):
#     # Make start and end time naive (local time assumed)
#     start_time = datetime.strptime(f"{date} {available_from}", "%Y-%m-%d %H:%M")
#     end_time = datetime.strptime(f"{date} {available_to}", "%Y-%m-%d %H:%M")

#     events = get_events(calendar_id, from_date=date, to_date=date)

#     slots = []
#     current = start_time

#     while current + timedelta(minutes=slot_duration) <= end_time:
#         slot_end = current + timedelta(minutes=slot_duration)

#         overlap = False
#         for e in events:
#             if "dateandtime" not in e:
#                 continue
#             e_start = parse_zoho_datetime(e["dateandtime"]["start"])
#             e_end = parse_zoho_datetime(e["dateandtime"]["end"])

#             if not (slot_end <= e_start or current >= e_end):
#                 overlap = True
#                 break

#         if not overlap:
#             slots.append({
#                 "start": current.strftime("%H:%M"),
#                 "end": slot_end.strftime("%H:%M")
#             })

#         current += timedelta(minutes=slot_duration)

#     return slots

# def get_free_slots_for_range(calendar_id, start_date=None, days=14, available_from="09:00", available_to="17:00", slot_duration=90):
#     """
#     Build free slots for the next two weeks from start_date.
#     Uses Zoho events API with a 14-day range.
#     """
#     if not start_date:
#         start_date = datetime.utcnow().strftime("%Y-%m-%d")

#     start_dt = datetime.strptime(start_date, "%Y-%m-%d")
#     end_dt = start_dt + timedelta(days=days)

#     events = get_events_for_range(
#         calendar_id, 
#         from_date=start_dt.strftime("%Y-%m-%d"), 
#         to_date=end_dt.strftime("%Y-%m-%d")
#         )

#     # Group events by date (YYYY-MM-DD)
#     events_by_date = {}
#     for e in events:
#         if "dateandtime" not in e:
#             continue
#         e_start = parse_zoho_datetime(e["dateandtime"]["start"])
#         e_date = e_start.strftime("%Y-%m-%d")
#         events_by_date.setdefault(e_date, []).append(e)

#     free_slots_by_date = {}

#     # Iterate each day in the 2-week window
#     for i in range(days):
#         day = (start_dt + timedelta(days=i)).strftime("%Y-%m-%d")

#         # Daily available time window
#         start_time = datetime.strptime(f"{day} {available_from}", "%Y-%m-%d %H:%M")
#         end_time = datetime.strptime(f"{day} {available_to}", "%Y-%m-%d %H:%M")

#         slots = []
#         current = start_time

#         # Check each possible slot
#         while current + timedelta(minutes=slot_duration) <= end_time:
#             slot_end = current + timedelta(minutes=slot_duration)

#             overlap = False
#             for e in events_by_date.get(day, []):
#                 e_start = parse_zoho_datetime(e["dateandtime"]["start"])
#                 e_end = parse_zoho_datetime(e["dateandtime"]["end"])
#                 if not (slot_end <= e_start or current >= e_end):
#                     overlap = True
#                     break

#             if not overlap:
#                 slots.append({
#                     "start": current.strftime("%H:%M"),
#                     "end": slot_end.strftime("%H:%M")
#                 })

#             current += timedelta(minutes=slot_duration)

#         free_slots_by_date[day] = slots

#     return free_slots_by_date


def get_free_slots_for_range(calendar_id, start_date=None, days=14):
    """
    Return actual event slots (start and end times) for the given range.
    """
    if not start_date:
        start_date = datetime.utcnow().strftime("%Y-%m-%d")

    start_dt = datetime.strptime(start_date, "%Y-%m-%d")
    end_dt = start_dt + timedelta(days=days)

    events = get_events_for_range(
        calendar_id,
        from_date=start_dt.strftime("%Y-%m-%d"),
        to_date=end_dt.strftime("%Y-%m-%d")
    )

    # Group events by date (YYYY-MM-DD)
    slots_by_date = {}
    for e in events:
        if "dateandtime" not in e:
            continue
        e_start = parse_zoho_datetime(e["dateandtime"]["start"])
        e_end = parse_zoho_datetime(e["dateandtime"]["end"])
        e_date = e_start.strftime("%Y-%m-%d")

        slots_by_date.setdefault(e_date, []).append({
            "start": e_start.strftime("%H:%M"),
            "end": e_end.strftime("%H:%M")
        })

    return slots_by_date
