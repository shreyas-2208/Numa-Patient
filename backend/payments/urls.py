# payments/urls.py
from django.urls import path
from . import views
from .views import CreateOrderForAppointmentView, VerifyPaymentView

urlpatterns = [
    path("start/<int:appointment_id>/", views.start_payment, name="start_payment"),
    # path("webhook/", views.payment_webhook, name="payment_webhook"),
    path("create-order/<int:appointment_id>/", CreateOrderForAppointmentView.as_view(), name="create-order"),
    path("verify-payment/", VerifyPaymentView.as_view(), name="verify-payment"),
    path("cancel-payment/", views.cancel_payment, name="cancel-payment"),
]
