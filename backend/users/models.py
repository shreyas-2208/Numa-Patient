from django.db import models
from django.contrib.auth.models import AbstractUser
from .managers import UserManager
from doctors.models import Doctor

class User(AbstractUser):
    email = models.EmailField(unique=True)   # used for login
    username = models.CharField(max_length=150, blank=True, null=True, unique=False)  # non-unique name
    is_patient = models.BooleanField(default=True)

    USERNAME_FIELD = "email"   # authentication uses email
    REQUIRED_FIELDS = []   

    objects = UserManager()

    def __str__(self):
        return self.email


class PatientProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    name = models.CharField(max_length=150, blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    dob = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, null=True, blank=True)
    reason_for_visit = models.JSONField(default=list, null=True, blank=True)
    preferred_languages = models.JSONField(default=list, blank=True)  
    preferred_session_timings = models.JSONField(default=list, blank=True)  
    preferred_time_of_day = models.CharField(max_length=20, null=True, blank=True)
    assigned_doctor = models.ForeignKey(
        Doctor,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="patients"  
    )
    onboarding_step = models.IntegerField(default=0)  # track onboarding progress
    is_onboarded = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} Profile"
