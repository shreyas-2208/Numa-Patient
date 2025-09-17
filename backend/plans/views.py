from rest_framework import generics, permissions
from .models import SessionPlan, PackagePlan
from .serializers import SessionPlanSerializer, PackagePlanSerializer

class SessionPlanListView(generics.ListAPIView):
    queryset = SessionPlan.objects.all()
    serializer_class = SessionPlanSerializer
    permission_classes = [permissions.AllowAny]

class PackagePlanListView(generics.ListAPIView):
    queryset = PackagePlan.objects.all()
    serializer_class = PackagePlanSerializer
    permission_classes = [permissions.AllowAny]
