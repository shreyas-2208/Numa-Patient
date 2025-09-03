from django.db import models
from django.contrib.auth.models import AbstractUser
from .managers import UserManager

class User(AbstractUser):
    email = models.EmailField(unique=True)   # used for login
    username = models.CharField(max_length=150, blank=True, null=True, unique=False)  # non-unique name
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    is_patient = models.BooleanField(default=True)

    USERNAME_FIELD = "email"   # authentication uses email
    REQUIRED_FIELDS = []   

    objects = UserManager()

    def __str__(self):
        return self.email


class PatientProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    dob = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, null=True, blank=True)
    preferred_language = models.CharField(max_length=20, null=True, blank=True)
    reason_for_visit = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.email} Profile"
