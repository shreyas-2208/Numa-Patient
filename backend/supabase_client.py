# backend/supabase_client.py
import os
from decouple import config
from supabase import create_client

SUPABASE_URL = config("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = config("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
