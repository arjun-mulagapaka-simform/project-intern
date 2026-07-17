import pytest
from users.serializers import PublicProfileSerializer, PrivateProfileSerializer

pytestmark = pytest.mark.django_db

def test_public_profile_serializer_serialization(user):
    """Test that PublicProfileSerializer serializes user data correctly."""
    serializer = PublicProfileSerializer(instance=user)
    data = serializer.data

    assert set(data.keys()) == {"username", "first_name", "last_name", "avatar", "bio"}
    assert data["username"] == user.username
    assert data["first_name"] == user.first_name
    assert data["last_name"] == user.last_name
    assert data["bio"] == user.bio
    assert user.avatar.url in data["avatar"]

def test_private_profile_serializer_serialization(user):
    """Test that PrivateProfileSerializer serializes user data correctly."""
    serializer = PrivateProfileSerializer(instance=user)
    data = serializer.data

    assert set(data.keys()) == {"email", "username", "first_name", "last_name", "avatar", "bio"}
    assert data["email"] == user.email
    assert data["username"] == user.username
    assert data["first_name"] == user.first_name
    assert data["last_name"] == user.last_name
    assert data["bio"] == user.bio
    assert user.avatar.url in data["avatar"]

def test_private_profile_serializer_validation(dummy_image):
    """Test that PrivateProfileSerializer validates update data correctly."""
    data = {
        "email": "updated@example.com",
        "username": "updatedusername",
        "first_name": "Updated",
        "last_name": "Name",
        "bio": "New updated bio.",
        "avatar": dummy_image(),
    }
    serializer = PrivateProfileSerializer(data=data)
    assert serializer.is_valid(), serializer.errors
    assert serializer.validated_data["email"] == "updated@example.com"
    assert serializer.validated_data["username"] == "updatedusername"
    assert serializer.validated_data["first_name"] == "Updated"
    assert serializer.validated_data["last_name"] == "Name"
    assert serializer.validated_data["bio"] == "New updated bio."
