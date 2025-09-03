# payments/services.py
import requests
from django.conf import settings

ZOHO_API_KEY = getattr(settings, "ZOHO_API_KEY", "your_api_key_here")
ZOHO_CHECKOUT_PAGE_ID = getattr(settings, "ZOHO_CHECKOUT_PAGE_ID", "your_checkout_page_id")
ZOHO_BASE_URL = "https://checkout.zoho.com/api/v1"

def create_payment_link(payment):
    payload = {
        "amount": float(payment.amount),
        "currency": payment.currency,
        "reference_id": str(payment.id),
        "redirect_url": f"http://localhost:8000/payments/webhook/",
    }

    headers = {"Authorization": f"Zoho-oauthtoken {ZOHO_API_KEY}"}
    response = requests.post(
        f"{ZOHO_BASE_URL}/hostedpages/{ZOHO_CHECKOUT_PAGE_ID}",
        json=payload,
        headers=headers,
    )
    response.raise_for_status()
    data = response.json()

    return data["hostedpage"]["url"]
