from rest_framework import serializers
from .models import Appointment
from doctors.serializers import DoctorSerializer

class AppointmentSerializer(serializers.ModelSerializer):
    patient_id = serializers.PrimaryKeyRelatedField(source='patient', read_only=True)
    # doctor_id = serializers.PrimaryKeyRelatedField(source='doctor', read_only=True)
    doctor = DoctorSerializer(read_only=True)  # Display doctor's name
    class Meta:
        model = Appointment
        fields = [
            'id',
            'patient_id',
            'doctor',
            'date',
            'time',
            'status',
            'session_plan',
            'package_plan',
            'zoho_booking_id',
            'zoho_meeting_link',
            'created_at'
        ]
        read_only_fields = ["patient", "status", "created_at"]
