# doctors/views.py
from rest_framework import generics, permissions
from .models import Doctor
from .serializers import DoctorSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from .services import assign_doctor_by_specialization
from rest_framework import status

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
        specialization = request.data.get("specialization")
        if specialization not in ["psychiatrist", "psychologist"]:
            return Response({"error": "Invalid specialization"}, status=status.HTTP_400_BAD_REQUEST)

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