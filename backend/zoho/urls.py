# backend/zoho/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # Auth test
    path("auth/test/", views.auth_test, name="zoho-auth-test"),
    
    # Calendar APIs
    path("calendars/", views.list_calendars, name="zoho-calendars"),
    path("calendars/<str:calendar_id>/events/", views.list_events, name="zoho-events"),
    path("calendars/<str:calendar_id>/free-slots/", views.free_slots, name="zoho-free-slots"),
]
