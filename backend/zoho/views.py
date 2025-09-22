from rest_framework.decorators import api_view
from rest_framework.response import Response
from .services import auth, calendar
from appointments.models import Appointment
import requests
import json
from datetime import datetime, timedelta

ZOHO_TOKEN = "1000.xxxxxxx"  # replace with your actual Zoho access token

@api_view(["GET"])
def auth_test(request):
    """
    Returns the current access token (refreshes if expired)
    """
    token = auth.get_access_token()
    return Response({"access_token": token})

@api_view(["GET"])
def list_calendars(request):
    try:
        calendars = calendar.get_calendars()
        return Response({"calendars": calendars})
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(["GET"])
def list_events(request, calendar_id):
    from_date = request.GET.get("from")
    to_date = request.GET.get("to")
    try:
        events = calendar.get_events_for_range(calendar_id, from_date=from_date, to_date=to_date)
        return Response({"events": events})
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(["GET"])
def free_slots(request, calendar_id, date=None):
    try:
        slots = calendar.get_free_slots_for_range(calendar_id, date)
        return Response({"slots": slots})
    except Exception as e:
        return Response({"error": str(e)}, status=400)

# ----------------- New Endpoint -----------------
