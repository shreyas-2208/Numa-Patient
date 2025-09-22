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
TOTAL_ONBOARDING_STEPS = 9  # match frontend total steps
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
                user, created = User.objects.get_or_create(
                    email=email,
                    defaults={"username": name}
                )

                refresh = RefreshToken.for_user(user)
                return Response({
                    "user": {"email": user.email, "username": user.username},
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                    "is_new_user": created
                })
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

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

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)

        if serializer.is_valid():
            # Check if onboarding is complete
             # match frontend total steps
            current_step = request.data.get("onboarded_step", 0)

            if current_step >= TOTAL_ONBOARDING_STEPS:
                serializer.save(is_onboarded=True, onboarding_step=current_step)
            else:
                serializer.save(onboarding_step=current_step)

            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
