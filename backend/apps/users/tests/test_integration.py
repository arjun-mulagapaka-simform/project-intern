import os
import shutil
import tempfile
import pytest
from django.urls import reverse
from rest_framework import status
from users.models import User

pytestmark = pytest.mark.django_db

@pytest.fixture(autouse=True)
def temp_media(settings):
    """Override MEDIA_ROOT with a temporary directory to isolate test file uploads."""
    temp_dir = tempfile.mkdtemp()
    settings.MEDIA_ROOT = temp_dir
    yield temp_dir
    shutil.rmtree(temp_dir, ignore_errors=True)

def test_user_profile_lifecycle_integration(auth_client, user, dummy_image, temp_media):
    """
    Integration Test:
    Verifies the full lifecycle of updating and retrieving a user's own profile.
    1. Sends a PUT request to update profile details and upload a new avatar.
    2. Validates view, serializer, and database integration.
    3. Confirms the avatar file was saved to the custom MEDIA_ROOT.
    4. Performs a subsequent GET request to retrieve own profile and confirms consistency.
    """
    url_me = reverse("self-profile-view")
    avatar_file = dummy_image("new_avatar.png")
    
    # 1. Update own profile
    update_data = {
        "email": "lifecycle_update@example.com",
        "username": "lifecycle_user",
        "first_name": "Lifecycle",
        "last_name": "Integration",
        "bio": "Tested end-to-end.",
        "avatar": avatar_file,
    }
    
    update_response = auth_client.put(url_me, update_data, format="multipart")
    assert update_response.status_code == status.HTTP_200_OK
    
    # 2. Validate response structure and updated data
    assert update_response.data["email"] == "lifecycle_update@example.com"
    assert update_response.data["username"] == "lifecycle_user"
    assert "avatar" in update_response.data
    
    # 3. Confirm file persistence in media storage
    user.refresh_from_db()
    assert user.email == "lifecycle_update@example.com"
    assert user.username == "lifecycle_user"
    assert user.avatar.name.startswith("avatar/new_avatar")
    
    saved_avatar_path = os.path.join(temp_media, user.avatar.name)
    assert os.path.exists(saved_avatar_path), f"Avatar not found at {saved_avatar_path}"
    
    # 4. Perform a GET request to retrieve own updated profile
    get_response = auth_client.get(url_me)
    assert get_response.status_code == status.HTTP_200_OK
    assert get_response.data["email"] == "lifecycle_update@example.com"
    assert get_response.data["username"] == "lifecycle_user"
    assert get_response.data["bio"] == "Tested end-to-end."

def test_cross_user_isolation_and_privacy_integration(api_client, user, another_user, dummy_image):
    """
    Integration Test:
    Verifies isolation between users and access control rules.
    1. Authenticates as user A, modifies their profile.
    2. Authenticates as user B, fetches user A's public profile.
    3. Confirms user B gets correct public info, and cannot see user A's private email.
    4. Confirms user B's own profile via 'me/' endpoint returns user B's details, not A's.
    """
    url_me = reverse("self-profile-view")
    
    # User A updates profile
    api_client.force_authenticate(user=user)
    update_response = api_client.put(url_me, {
        "email": "user_a@example.com",
        "username": "user_a",
        "first_name": "Alice",
        "last_name": "Smith",
        "bio": "Alice's Bio",
        "avatar": dummy_image("alice.png")
    }, format="multipart")
    assert update_response.status_code == status.HTTP_200_OK
    
    # User B logs in
    api_client.force_authenticate(user=another_user)
    
    # User B accesses User A's public profile
    url_public_a = reverse("public-profile-view", kwargs={"username": "user_a"})
    public_response = api_client.get(url_public_a)
    assert public_response.status_code == status.HTTP_200_OK
    assert public_response.data["username"] == "user_a"
    assert public_response.data["first_name"] == "Alice"
    assert public_response.data["last_name"] == "Smith"
    assert public_response.data["bio"] == "Alice's Bio"
    assert "email" not in public_response.data  # Privacy check: email is excluded
    
    # User B accesses their own profile
    me_response = api_client.get(url_me)
    assert me_response.status_code == status.HTTP_200_OK
    assert me_response.data["username"] == another_user.username
    assert me_response.data["email"] == another_user.email

def test_invalid_upload_rollback_and_error_handling_integration(auth_client, user):
    """
    Integration Test:
    Verifies how the API handles malformed/invalid inputs during update requests.
    1. Sends a PUT request with invalid email format and empty username.
    2. Validates that the views and serializers intercept the errors correctly (HTTP 400).
    3. Confirms the database transaction remains unmodified (no changes are committed).
    """
    url_me = reverse("self-profile-view")
    original_username = user.username
    original_email = user.email
    
    invalid_data = {
        "email": "not-an-email",
        "username": "",  # Username is required and cannot be empty
        "first_name": "Invalid",
    }
    
    response = auth_client.put(url_me, invalid_data)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "email" in response.data
    assert "username" in response.data
    
    # Verify rollback/no-change in DB
    user.refresh_from_db()
    assert user.username == original_username
    assert user.email == original_email
