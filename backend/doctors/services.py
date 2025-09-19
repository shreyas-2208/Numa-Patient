from django.db import transaction
from django.utils import timezone
from .models import Doctor
from django.db.models.functions import Coalesce

def assign_doctor_by_specialization(specialization: str):
    """
    Assigns a doctor for the given specialization using round robin.
    Ensures atomicity so two patients don’t get the same doctor at the same time.
    """

    with transaction.atomic():
        doctors = (
            Doctor.objects
            .select_for_update(skip_locked=True)
            .filter(specialization=specialization)
            .annotate(
        # Replace NULL with a very old timestamp for sorting
            safe_last=Coalesce("last_assigned", timezone.datetime(1970, 4, 8))
            )
            .order_by("safe_last", "id")
        )

        print(doctors)
        if not doctors.exists():
            return None

        doctor = doctors.first()
        doctor.last_assigned = timezone.now()
        doctor.save(update_fields=["last_assigned"])
        return doctor