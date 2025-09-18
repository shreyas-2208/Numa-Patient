from rest_framework import serializers
from .models import Appointment

class AppointmentSerializer(serializers.ModelSerializer):
    patient_id = serializers.PrimaryKeyRelatedField(source='patient', read_only=True)
    doctor_id = serializers.PrimaryKeyRelatedField(source='doctor', read_only=True)
    class Meta:
        model = Appointment
        fields = [
            'id',
            'patient_id',
            'doctor_id',
            'date',
            'time',
            'status',
            'created_at'
        ]
        read_only_fields = ["patient", "status", "created_at"]
