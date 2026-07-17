from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate



class RegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(style = {"input_type":"password"}, write_only = True)
    class Meta:
        model = get_user_model()
        fields = ['username', 'email', 'password', 'password2']
        extra_kwargs = {
            "password" : {"write_only" : True},
            "email" : {"required" : True, "allow_blank" : False}
        }
    
    def validate(self, attrs):
        password = attrs.get('password')
        password2 = attrs.get('password2')
        if password and password2 and password != password2:
            raise serializers.ValidationError({"password":"Both the passwords should match"})
        return attrs
    
    def create(self, validated_data):
            validated_data.pop('password2')

            User = get_user_model()

            user = User(
                username = validated_data['username'],
                email = validated_data['email']
            )
            user.set_password(validated_data['password'])
            user.save()
            
            return user
        
class LoginSerializer(TokenObtainPairSerializer):
    username = serializers.CharField()
    password = serializers.CharField(style = {"input_type":"password"}, write_only = True)

    def validate(self, attrs):
        user = authenticate(
            username = attrs.get('username'),
            password = attrs.get('password')
        )

        if user is None:
            raise serializers.ValidationError("User does not exist")
        
        data = super().get_token(user)

        return {
            "refresh": str(data),
            "access": str(data.access_token),
        }
