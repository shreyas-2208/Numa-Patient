# doctors/views.py
from rest_framework import generics, permissions
from .models import Doctor
from .serializers import DoctorSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from .services import assign_doctor_by_specialization
from rest_framework import status
import random
from django.utils import timezone

# List all doctors (any authenticated user can see)
class DoctorListView(generics.ListAPIView):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    permission_classes = [permissions.IsAuthenticated]

# Doctor detail
class DoctorDetailView(generics.RetrieveAPIView):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    permission_classes = [permissions.IsAuthenticated]

# Add a doctor (admin only)
class DoctorCreateView(generics.CreateAPIView):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    permission_classes = [permissions.IsAdminUser]

class UserDoctorView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            # Assuming Doctor model has OneToOne relation with User
            doctor = Doctor.objects.get(user=request.user)
            serializer = DoctorSerializer(doctor)
            return Response(serializer.data)
        except Doctor.DoesNotExist:
            return Response({"detail": "No doctor assigned to this user."}, status=404)
        
class AssignDoctorView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        issues = request.data.get("issues")
        language = request.data.get("language")

        if not issues or not language:
            return Response({"error": "Issue and language are required"}, status=status.HTTP_400_BAD_REQUEST)

        # Define issues that lean toward psychiatrists
        psychiatrist_issues = [
            "Depression", "OCD", "ADHD", "Addiction", "Insomnia",
            "Panic attacks", "Trauma"
        ]

        # Weighting: If the issue is in psychiatrist_issues, bias toward psychiatrists
        specialization = "psychiatrist" if any(issue in psychiatrist_issues for issue in issues) else "psychologist"

        # First try to find doctors by specialization + language
        doctors = Doctor.objects.filter(
            specialization=specialization,
            languages__icontains=language  # assumes a field storing languages (comma-separated or JSON)
        )

        if not doctors.exists():
            # Fallback: ignore language filter
            doctors = Doctor.objects.filter(specialization=specialization)

        if not doctors.exists():
            return Response({"error": "No doctor available"}, status=status.HTTP_404_NOT_FOUND)

        # Simple random assignment (you could also balance workload by last_assigned)
        doctor = random.choice(doctors)

        # Update doctor's last_assigned
        doctor.last_assigned = timezone.now()
        doctor.save(update_fields=["last_assigned"])

        return Response({
            "doctor_id": doctor.id,
            "doctor_name": doctor.name,
            "specialization": doctor.specialization,
            "email": doctor.email,
            "phone_number": doctor.phone_number,
        }, status=status.HTTP_200_OK)
    
    def get(self, request):
        try:
            doctor = Doctor.objects.get(user=request.user)
            serializer = DoctorSerializer(doctor)
            return Response(serializer.data)
        except Doctor.DoesNotExist:
            return Response({"detail": "No doctor assigned to this user."}, status=404)
        
class AssignDoctorBySpecializationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, specialization=None):
        doctor = assign_doctor_by_specialization(specialization)
        if not doctor:
            return Response({"error": "No doctor available"}, status=status.HTTP_404_NOT_FOUND)

        return Response({
            "doctor_id": doctor.id,
            "doctor_name": doctor.name,
            "specialization": doctor.specialization,
            "email": doctor.email,
            "phone_number": doctor.phone_number,
        }, status=status.HTTP_200_OK)