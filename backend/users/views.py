from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from .models import User, PatientProfile
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer, PatientProfileSerializer, PatientOnboardingSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from google.oauth2 import id_token
from google.auth.transport import requests
from decouple import config

GOOGLE_CLIENT_ID= config("GOOGLE_CLIENT_ID"),

# Register endpoint
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user_data = serializer.save()
        return Response(user_data, status=status.HTTP_201_CREATED)

# Login endpoint (JWT)
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data

        refresh = RefreshToken.for_user(user)
        return Response({
            "user": UserSerializer(user).data,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        })

# Profile view
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = request.user.profile
        serializer = PatientProfileSerializer(profile)
        return Response(serializer.data)

    def put(self, request):
        profile = request.user.profile
        serializer = PatientProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    
class PatientOnboardingView(generics.RetrieveUpdateAPIView):
    serializer_class = PatientOnboardingSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        obj, created = PatientProfile.objects.get_or_create(user=self.request.user)
        return obj    

class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get("token") 
        try:
            # Verify with Google
            idinfo = id_token.verify_oauth2_token(
                token, 
                requests.Request(),
                GOOGLE_CLIENT_ID
                )

            email = idinfo["email"]
            name = idinfo["name"]

            # Create or get user
            user, _ = User.objects.get_or_create(
                email=email,
                defaults={"username": name}
            )

            refresh = RefreshToken.for_user(user)
            return Response({
                "user": {"email": user.email, "username": user.username},
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            })
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)