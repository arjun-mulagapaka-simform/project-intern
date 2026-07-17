from rest_framework import generics
from users.serializers import *
from rest_framework.permissions import IsAuthenticated, AllowAny
from users.models import User
from rest_framework_simplejwt.views import TokenObtainPairView

class SelfProfileView(generics.RetrieveUpdateAPIView):
    '''
    Class to get or update your own profile
    '''
    serializer_class = PrivateProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user

class PublicProfileView(generics.RetrieveAPIView):
    '''
    Class to view a public profile
    '''
    serializer_class = PublicProfileSerializer
    lookup_field = "username"
    permission_classes = [AllowAny]
    queryset = User.objects.all()


class RegisterView(CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer


