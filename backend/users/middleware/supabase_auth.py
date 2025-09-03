# backend/users/middleware/supabase_auth.py
from django.utils.deprecation import MiddlewareMixin
from django.conf import settings
from decouple import config
from .. import models as user_models  # optional
from supabase_client import supabase     # project supabase client
import logging

logger = logging.getLogger(__name__)

class SupabaseAuthMiddleware:
    """
    Reads Authorization: Bearer <token> header and sets:
      request.supabase_user (dict) or None
      request.user_id (uuid string) or None
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.supabase_user = None
        request.user_id = None

        auth = request.headers.get("Authorization") or request.META.get("HTTP_AUTHORIZATION")
        if auth and auth.startswith("Bearer "):
            token = auth.split(" ", 1)[1].strip()
            try:
                # Try server-side lookup
                res = supabase.auth.get_user(token)
                # supabase-py returns an object; try multiple access patterns
                user = None
                if isinstance(res, dict):
                    user = res.get("data", {}).get("user") or res.get("user")
                else:
                    # object with attribute 'user' or 'data'
                    user = getattr(res, "user", None) or getattr(res, "data", {}).get("user") if hasattr(res, "data") else None

                if not user:
                    # some versions: res.data.user
                    data = getattr(res, "data", None)
                    if data and isinstance(data, dict):
                        user = data.get("user")
                if user:
                    request.supabase_user = user
                    request.user_id = user.get("id")
            except Exception as e:
                # If get_user fails, ignore and treat as anonymous
                logger.debug("Supabase get_user failed: %s", e)

        response = self.get_response(request)
        return response
