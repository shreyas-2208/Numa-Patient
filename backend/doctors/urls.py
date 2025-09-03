# doctors/urls.py
from django.urls import path
from .views import DoctorListView, DoctorDetailView, DoctorCreateView

urlpatterns = [
    path("", DoctorListView.as_view(), name="doctor-list"),
    path("<int:pk>/", DoctorDetailView.as_view(), name="doctor-detail"),
    path("add/", DoctorCreateView.as_view(), name="doctor-create"),
]
