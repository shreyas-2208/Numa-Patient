# notifications/urls.py
from django.urls import path
from .views import NotificationListView, NotificationUpdateView

urlpatterns = [
    path("", NotificationListView.as_view(), name="notifications"),
    path("<int:pk>/", NotificationUpdateView.as_view(), name="notification-update"),
]
