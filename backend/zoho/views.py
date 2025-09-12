from rest_framework.decorators import api_view
from rest_framework.response import Response
from .services import auth, calendar

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
        events = calendar.get_events(calendar_id, from_date=from_date, to_date=to_date)
        return Response({"events": events})
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(["GET"])
def free_slots(request, calendar_id):
    date = request.GET.get("date")  # format YYYY-MM-DD
    if not date:
        return Response({"error": "Missing 'date' query param"}, status=400)
    try:
        slots = calendar.get_free_slots(calendar_id, date)
        return Response({"date": date, "slots": slots})
    except Exception as e:
        return Response({"error": str(e)}, status=400)
