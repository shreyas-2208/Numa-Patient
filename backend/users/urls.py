from django.urls import path
from .views import RegisterView, LoginView, ProfileView, GoogleLoginView, PatientOnboardingView, ForgotPasswordSimpleView, ResetPasswordView
from django.urls import include

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("google-login/", GoogleLoginView.as_view(), name="google-login"),
    path("forgot-password/", ForgotPasswordSimpleView.as_view()),  
    path("reset-password/", ResetPasswordView.as_view()),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("onboarding/", PatientOnboardingView.as_view(), name="onboarding"),
]
