import pytest
from io import BytesIO
from PIL import Image
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from goals.models import Goal

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user(db):
    return User.objects.create_user(
        username="testuser",
        email="testuser@example.com",
        password="testpassword123"
    )


@pytest.fixture
def auth_client(api_client, user):
    api_client.force_authenticate(user=user)
    return api_client


@pytest.fixture
def another_user(db):
    return User.objects.create_user(
        username="anotheruser",
        email="anotheruser@example.com",
        password="testpassword123"
    )


@pytest.fixture
def another_auth_client(another_user):
    client = APIClient()
    client.force_authenticate(user=another_user)
    return client


@pytest.fixture
def goal(user):
    return Goal.objects.create(user=user, description="Daily Run", cadence="daily")


@pytest.fixture
def archived_goal(user):
    return Goal.objects.create(
        user=user, description="Archived Goal", cadence="daily", is_active=False
    )


@pytest.fixture
def another_users_goal(another_user):
    return Goal.objects.create(user=another_user, description="Not Yours", cadence="daily")


@pytest.fixture
def dummy_image():
    """Small valid PNG, well under any size limit, with an allowed content type."""
    def _generate_image(name="test_post.png"):
        file_obj = BytesIO()
        Image.new("RGB", (50, 50), color="blue").save(file_obj, format="PNG")
        file_obj.seek(0)
        return SimpleUploadedFile(name, file_obj.read(), content_type="image/png")
    return _generate_image


@pytest.fixture
def oversized_image():
    """A real (valid) image whose raw bytes exceed the 5MB limit, via uncompressed BMP."""
    def _generate_image(name="huge.bmp"):
        file_obj = BytesIO()
        Image.new("RGB", (2000, 2000), color="red").save(file_obj, format="BMP")
        file_obj.seek(0)
        return SimpleUploadedFile(name, file_obj.read(), content_type="image/bmp")
    return _generate_image


@pytest.fixture
def unsupported_type_image():
    """A real, small, valid image whose content type isn't in the allowed set."""
    def _generate_image(name="test_post.gif"):
        file_obj = BytesIO()
        Image.new("RGB", (50, 50), color="green").save(file_obj, format="GIF")
        file_obj.seek(0)
        return SimpleUploadedFile(name, file_obj.read(), content_type="image/gif")
    return _generate_image
