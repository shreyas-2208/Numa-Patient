from rest_framework import serializers
from .models import User, PatientProfile
from django.contrib.auth import authenticate
from datetime import date
from rest_framework_simplejwt.tokens import RefreshToken

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "username", "is_patient"]

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["email", "password"]

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"]
        )
        refresh = RefreshToken.for_user(user)

        return {
            "email": user.email,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }

# class RegisterSerializer(serializers.ModelSerializer):
#     dob = serializers.DateField(required=False)
#     gender = serializers.ChoiceField(choices=[("M", "Male"), ("F", "Female"), ("O", "Other")], required=False)
#     password = serializers.CharField(write_only=True)

#     class Meta:
#         model = User
#         fields = ["email", "username", "gender", "dob", "phone_number", "password"]

#     def create(self, validated_data):
#         dob = validated_data.pop("dob", None)       
#         gender = validated_data.pop("gender", None)
                                    
#         user = User.objects.create_user(
#             email=validated_data["email"],
#             username=validated_data["username"],
#             phone_number=validated_data.get("phone_number"),
#             password=validated_data["password"]
#         )
        
#         PatientProfile.objects.create(
#             user=user,
#             dob=dob,
#             gender=gender,
#         )        
        
#         return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data["email"], password=data["password"])
        if not user:
            raise serializers.ValidationError("Invalid credentials")
        return user

class PatientProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)
    age = serializers.SerializerMethodField()
    name=serializers.CharField(source="user.username", read_only=True)
    class Meta:
        model = PatientProfile
        fields = ["name", "email", "age", "dob", "gender"]

    def get_age(self, obj):
        if obj.dob:
            today = date.today()
            return today.year - obj.dob.year - (
                (today.month, today.day) < (obj.dob.month, obj.dob.day)
            )
        return None

class PatientOnboardingSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientProfile
        fields = "__all__"
        read_only_fields = ["user"]