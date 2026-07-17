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


class TokenRefreshAndLogoutAPITest(APITestCase):
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
        self.refresh_url = reverse('refresh')
        self.logout_url = reverse('logout')

        # Get initial tokens
        response = self.client.post(self.login_url, {
            "username": self.username,
            "password": self.password
        }, format='json')
        self.tokens = response.data
        self.access_token = self.tokens["access"]
        self.refresh_token = self.tokens["refresh"]

    def test_refresh_token_success(self):
        # Refreshing a valid refresh token should return a new access token
        data = {
            "refresh": self.refresh_token
        }
        response = self.client.post(self.refresh_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

    def test_refresh_token_invalid(self):
        # Refreshing an invalid refresh token should return 401 Unauthorized
        data = {
            "refresh": "invalid_refresh_token"
        }
        response = self.client.post(self.refresh_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_success(self):
        # Logging out with a valid refresh token should blacklist the token and return 200 OK
        data = {
            "refresh": self.refresh_token
        }
        response = self.client.post(self.logout_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # After logout/blacklisting, using the same refresh token to get a new access token should fail
        refresh_response = self.client.post(self.refresh_url, data, format='json')
        self.assertEqual(refresh_response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_invalid_token(self):
        # Logging out with an invalid refresh token should return 401 Unauthorized or 400 Bad Request
        data = {
            "refresh": "invalid_refresh_token"
        }
        response = self.client.post(self.logout_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class UserAuthIntegrationTest(APITestCase):
    def setUp(self):
        self.register_url = reverse('register')
        self.login_url = reverse('login')
        self.refresh_url = reverse('refresh')
        self.logout_url = reverse('logout')

        self.username = "integrationuser"
        self.email = "integration@example.com"
        self.password = "SecurePassword123!"

    def test_full_auth_lifecycle(self):
        # 1. REGISTER the user
        register_data = {
            "username": self.username,
            "email": self.email,
            "password": self.password,
            "password2": self.password
        }
        register_response = self.client.post(self.register_url, register_data, format='json')
        self.assertEqual(register_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(register_response.data["username"], self.username)
        self.assertEqual(register_response.data["email"], self.email)

        # 2. LOGIN with registered credentials
        login_data = {
            "username": self.username,
            "password": self.password
        }
        login_response = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertIn("access", login_response.data)
        self.assertIn("refresh", login_response.data)

        refresh_token = login_response.data["refresh"]
        access_token = login_response.data["access"]

        # 3. REFRESH the access token using the refresh token
        refresh_data = {
            "refresh": refresh_token
        }
        refresh_response = self.client.post(self.refresh_url, refresh_data, format='json')
        self.assertEqual(refresh_response.status_code, status.HTTP_200_OK)
        self.assertIn("access", refresh_response.data)
        
        new_access_token = refresh_response.data["access"]
        self.assertNotEqual(access_token, new_access_token)

        # 4. LOGOUT (Blacklist the refresh token)
        logout_response = self.client.post(self.logout_url, {"refresh": refresh_token}, format='json')
        self.assertEqual(logout_response.status_code, status.HTTP_200_OK)

        # 5. REFRESH again - should fail as token is blacklisted
        failed_refresh_response = self.client.post(self.refresh_url, {"refresh": refresh_token}, format='json')
        self.assertEqual(failed_refresh_response.status_code, status.HTTP_401_UNAUTHORIZED)




