import requests
from decouple import config
import time

CLIENT_ID = config("ZOHO_CLIENT_ID")
CLIENT_SECRET = config("ZOHO_CLIENT_SECRET")
REFRESH_TOKEN = config("ZOHO_REFRESH_TOKEN")
TOKEN_URL = "https://accounts.zoho.in/oauth/v2/token"

# Simple in-memory cache for access token and expiry
_access_token = None
_expiry_time = 0

def get_access_token():
    """
    Returns a valid access token. Refreshes it automatically if expired.
    """
    global _access_token, _expiry_time

    if _access_token and time.time() < _expiry_time - 60:
        return _access_token  # return cached token if not expired

    data = {
        "refresh_token": REFRESH_TOKEN,
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "grant_type": "refresh_token",
    }

    response = requests.post(TOKEN_URL, data=data)
    resp_json = response.json()
    
    if response.status_code != 200:
        print("Zoho response:", resp_json)
        raise Exception(f"Failed to refresh Zoho access token: {resp_json}")

    access_token = resp_json.get("access_token")
    if not access_token:
        print("Zoho response:", resp_json)
        raise Exception(f"No access token returned: {resp_json}")

    # Cache token
    _access_token = access_token
    _expiry_time = time.time() + int(resp_json.get("expires_in", 3600))
    return _access_token

