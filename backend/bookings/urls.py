from django.urls import path
from .views import CreateZohoBookingView

urlpatterns = [
    path("create/", CreateZohoBookingView.as_view(), name="create-zoho-booking"),
]