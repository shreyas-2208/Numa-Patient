# payments/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path("start/<int:appointment_id>/", views.start_payment, name="start_payment"),
    path("webhook/", views.payment_webhook, name="payment_webhook"),
]
