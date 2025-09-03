# notifications/services.py
import requests
from django.conf import settings

# Get your Zoho API keys from settings.py
ZOHO_MAIL_API_KEY = getattr(settings, "ZOHO_MAIL_API_KEY", "your_zoho_mail_token")
ZOHO_SMS_API_KEY = getattr(settings, "ZOHO_SMS_API_KEY", "your_zoho_sms_token")

# -------------------------
# Send Email Notification
# -------------------------
def send_email_notification(user, subject, message):
    """
    Sends email using Zoho Mail API
    """
    email = user.email
    if not email:
        return False

    url = "https://mail.zoho.com/api/accounts/{account_id}/messages"  # replace with your account ID
    headers = {
        "Authorization": f"Zoho-oauthtoken {ZOHO_MAIL_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "fromAddress": "your_email@yourdomain.com",
        "toAddress": email,
        "subject": subject,
        "content": message,
        "contentType": "text/html"
    }

    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        return True
    except Exception as e:
        print("Email send failed:", e)
        return False

# -------------------------
# Send SMS Notification
# -------------------------
def send_sms_notification(user, message):
    """
    Sends SMS using Zoho SMS (or fallback to another provider like Twilio).
    """
    phone = getattr(user, "phone_number", None)  # ensure your User model has phone_number
    if not phone:
        return False

    url = "https://www.zohoapis.com/sms/v1/messages"  # Example endpoint
    headers = {
        "Authorization": f"Zoho-oauthtoken {ZOHO_SMS_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "phone": phone,
        "message": message,
        "sender": "DOCAPP"  # Zoho requires sender id
    }

    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        return True
    except Exception as e:
        print("SMS send failed:", e)
        return False
