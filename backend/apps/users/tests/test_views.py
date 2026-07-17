import pytest
from django.urls import reverse
from rest_framework import status
from users.models import User

pytestmark = pytest.mark.django_db

def test_self_profile_get_authenticated(auth_client, user):
    """Test retrieving own profile when authenticated."""
    url = reverse("self-profile-view")
    response = auth_client.get(url)
    
    assert response.status_code == status.HTTP_200_OK
    assert response.data["username"] == user.username
    assert response.data["email"] == user.email
    assert response.data["bio"] == user.bio
    assert "avatar" in response.data

def test_self_profile_get_unauthenticated(api_client):
    """Test retrieving own profile when unauthenticated fails."""
    url = reverse("self-profile-view")
    response = api_client.get(url)
    
    assert response.status_code in [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN]

def test_self_profile_update_authenticated(auth_client, user, dummy_image):
    """Test updating own profile when authenticated."""
    url = reverse("self-profile-view")
    data = {
        "email": "newemail@example.com",
        "username": "newusername",
        "first_name": "NewFirst",
        "last_name": "NewLast",
        "bio": "New Bio",
        "avatar": dummy_image(),
    }
    
    response = auth_client.put(url, data, format="multipart")
    
    assert response.status_code == status.HTTP_200_OK, response.data
    assert response.data["email"] == "newemail@example.com"
    assert response.data["username"] == "newusername"
    assert response.data["first_name"] == "NewFirst"
    assert response.data["last_name"] == "NewLast"
    assert response.data["bio"] == "New Bio"
    
    # Verify in DB
    user.refresh_from_db()
    assert user.email == "newemail@example.com"
    assert user.username == "newusername"
    assert user.first_name == "NewFirst"
    assert user.last_name == "NewLast"
    assert user.bio == "New Bio"

def test_self_profile_partial_update_authenticated(auth_client, user):
    """Test partially updating own profile when authenticated."""
    url = reverse("self-profile-view")
    data = {
        "bio": "Another bio modification",
    }
    
    response = auth_client.patch(url, data)
    
    assert response.status_code == status.HTTP_200_OK
    assert response.data["bio"] == "Another bio modification"
    assert response.data["username"] == user.username  # should remain unchanged
    
    user.refresh_from_db()
    assert user.bio == "Another bio modification"

def test_self_profile_update_unauthenticated(api_client):
    """Test updating own profile when unauthenticated fails."""
    url = reverse("self-profile-view")
    data = {
        "bio": "Unauthorized update",
    }
    response = api_client.put(url, data)
    assert response.status_code in [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN]
    
    response = api_client.patch(url, data)
    assert response.status_code in [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN]

def test_public_profile_get_existing(api_client, another_user):
    """Test retrieving an existing user's public profile."""
    url = reverse("public-profile-view", kwargs={"username": another_user.username})
    response = api_client.get(url)
    
    assert response.status_code == status.HTTP_200_OK
    assert response.data["username"] == another_user.username
    assert "email" not in response.data  # email should be private
    assert response.data["bio"] == another_user.bio

def test_public_profile_get_non_existing(api_client):
    """Test retrieving a non-existing user's public profile returns 404."""
    url = reverse("public-profile-view", kwargs={"username": "non_existent_user"})
    response = api_client.get(url)
    
    assert response.status_code == status.HTTP_404_NOT_FOUND

def test_public_profile_methods_not_allowed(api_client, another_user):
    """Test that PUT, PATCH, DELETE are not allowed on public profile view."""
    url = reverse("public-profile-view", kwargs={"username": another_user.username})
    
    assert api_client.put(url, {"username": "hack"}).status_code == status.HTTP_405_METHOD_NOT_ALLOWED
    assert api_client.patch(url, {"username": "hack"}).status_code == status.HTTP_405_METHOD_NOT_ALLOWED
    assert api_client.delete(url).status_code == status.HTTP_405_METHOD_NOT_ALLOWED
