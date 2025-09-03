from django.urls import path
from .views import AppointmentCreateView, AppointmentListView, AppointmentUpdateView

urlpatterns = [
    path("create/", AppointmentCreateView.as_view(), name="create-appointment"),
    path("my/", AppointmentListView.as_view(), name="my-appointments"),
    path("<int:pk>/", AppointmentUpdateView.as_view(), name="update-appointment"),
]
