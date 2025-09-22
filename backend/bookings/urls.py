from django.urls import path
from .views import CreateZohoBookingView, fetch_followup_appointments

urlpatterns = [
    path("create/", CreateZohoBookingView.as_view(), name="create-zoho-booking"),
    path("fetch-followups/", fetch_followup_appointments, name="get-zoho-bookings"),
]