import pytest
from io import BytesIO
from PIL import Image
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from users.models import User

@pytest.fixture
def api_client():
    """Fixture for DRF API Client."""
    return APIClient()

@pytest.fixture
def dummy_image():
    """Fixture to generate a dummy image factory for testing file uploads."""
    def _generate_image(name="test_avatar.png"):
        file_obj = BytesIO()
        image = Image.new("RGB", (50, 50), color="blue")
        image.save(file_obj, format="PNG")
        file_obj.seek(0)
        return SimpleUploadedFile(name, file_obj.read(), content_type="image/png")
    return _generate_image

@pytest.fixture
def user_data(dummy_image):
    """Fixture for user data."""
    return {
        "username": "testuser",
        "email": "testuser@example.com",
        "password": "testpassword123",
        "first_name": "Test",
        "last_name": "User",
        "bio": "This is a test bio.",
        "avatar": dummy_image(),
    }

@pytest.fixture
def user(db, user_data):
    """Fixture for creating a test user."""
    avatar = user_data.pop("avatar")
    password = user_data.pop("password")
    user = User.objects.create_user(**user_data)
    user.set_password(password)
    user.avatar = avatar
    user.save()
    return user

@pytest.fixture
def auth_client(api_client, user):
    """Fixture for an authenticated API Client."""
    api_client.force_authenticate(user=user)
    return api_client

@pytest.fixture
def another_user(db):
    """Fixture for creating another test user for public profile tests."""
    user = User.objects.create_user(
        username="anotheruser",
        email="anotheruser@example.com",
        first_name="Another",
        last_name="User",
        bio="Another test bio."
    )
    return user
