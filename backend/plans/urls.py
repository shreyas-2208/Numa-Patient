from django.urls import path
from .views import SessionPlanListView, PackagePlanListView

urlpatterns = [
    path("session-plans/", SessionPlanListView.as_view(), name="session-plans"),
    path("package-plans/", PackagePlanListView.as_view(), name="package-plans"),
]
