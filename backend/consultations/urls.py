from django.urls import path
from .views import create_consultation

urlpatterns = [
    path("create/<int:appointment_id>/", create_consultation, name="create_consultation"),
]
