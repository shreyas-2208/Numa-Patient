from rest_framework import serializers
from .models import SessionPlan, PackagePlan

class SessionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SessionPlan
        fields = "__all__"

class PackagePlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = PackagePlan
        fields = "__all__"
