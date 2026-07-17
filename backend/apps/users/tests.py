from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from apps.users.serializers import RegisterSerializer, LoginSerializer

User = get_user_model()

class RegisterSerializerTest(TestCase):
    def test_email_is_required(self):
        # When email is missing, validation should fail
        data = {
            "username": "testuser",
            "password": "testpassword123",
            "password2": "testpassword123"
        }
        serializer = RegisterSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("email", serializer.errors)

    def test_matching_passwords_required(self):
        # When passwords don't match, validation should fail
        data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "password1",
            "password2": "password-different"
        }
        serializer = RegisterSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("password", serializer.errors)


class LoginSerializerTest(TestCase):
    def setUp(self):
        self.username = "testuser"
        self.password = "testpassword123"
        self.email = "test@example.com"
        self.user = User.objects.create_user(
            username=self.username,
            email=self.email,
            password=self.password
        )

    def test_login_serializer_success(self):
        # Valid login details should pass validation and return tokens
        data = {
            "username": self.username,
            "password": self.password
        }
        serializer = LoginSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        self.assertIn("access", serializer.validated_data)
        self.assertIn("refresh", serializer.validated_data)

    def test_login_serializer_invalid_password(self):
        # Validation should fail when an incorrect password is provided
        data = {
            "username": self.username,
            "password": "wrongpassword"
        }
        serializer = LoginSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("non_field_errors", serializer.errors)
        self.assertEqual(serializer.errors["non_field_errors"][0], "User does not exist")

    def test_login_serializer_nonexistent_user(self):
        # Validation should fail when username does not exist
        data = {
            "username": "nonexistentuser",
            "password": "somepassword"
        }
        serializer = LoginSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("non_field_errors", serializer.errors)
        self.assertEqual(serializer.errors["non_field_errors"][0], "User does not exist")


class LoginAPITest(APITestCase):
    def setUp(self):
        self.username = "testuser"
        self.password = "testpassword123"
        self.email = "test@example.com"
        self.user = User.objects.create_user(
            username=self.username,
            email=self.email,
            password=self.password
        )
        self.login_url = reverse('login')

    def test_login_api_success(self):
        # Successful login API call should return 200 OK and valid JWT tokens
        data = {
            "username": self.username,
            "password": self.password
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_login_api_invalid_password(self):
        # Incorrect password should return 400 Bad Request
        data = {
            "username": self.username,
            "password": "wrongpassword"
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("non_field_errors", response.data)
        self.assertEqual(response.data["non_field_errors"][0], "User does not exist")

    def test_login_api_user_not_found(self):
        # Request with a non-existent username should return 400 Bad Request
        data = {
            "username": "nonexistentuser",
            "password": "somepassword"
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("non_field_errors", response.data)
        self.assertEqual(response.data["non_field_errors"][0], "User does not exist")

    def test_login_api_missing_fields(self):
        # Missing username should return 400 Bad Request
        data = {
            "password": self.password
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("username", response.data)

        # Missing password should return 400 Bad Request
        data = {
            "username": self.username
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", response.data)


