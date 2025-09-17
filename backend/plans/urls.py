from django.urls import path
from .views import SessionPlanListView, PackagePlanListView

urlpatterns = [
    path("sessions/", SessionPlanListView.as_view(), name="session-plans"),
    path("packages/", PackagePlanListView.as_view(), name="package-plans"),
]
