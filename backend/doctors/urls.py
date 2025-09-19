# doctors/urls.py
from django.urls import path
from .views import DoctorListView, DoctorDetailView, DoctorCreateView, UserDoctorView, AssignDoctorView

urlpatterns = [
    path("", DoctorListView.as_view(), name="doctor-list"),
    path("<int:pk>/", DoctorDetailView.as_view(), name="doctor-detail"),
    path("add/", DoctorCreateView.as_view(), name="doctor-create"),

    # added for testing
    path("me/", UserDoctorView.as_view(), name="user-doctor"),
    path("assign/", AssignDoctorView.as_view(), name="assign-doctor"),
]
    