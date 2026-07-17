from django.shortcuts import render
from rest_framework.generics import CreateAPIView    
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from .serializers import RegisterSerializer,LoginSerializer
from rest_framework_simplejwt.views import TokenObtainPairView


class RegisterView(CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer


