from rest_framework import serializers
from users.models import User


class PublicProfileSerializer(serializers.ModelSerializer):
    """
    Profile serializer for public endpoints
    """
    class Meta:
        model = User
        fields = ["username","first_name","last_name","avatar","bio"]
    
class PrivateProfileSerializer(serializers.ModelSerializer):
    """
    Profile serializer for user's self request
    """
    class Meta:
        model = User
        fields = ["email","username","first_name","last_name","avatar","bio"]
