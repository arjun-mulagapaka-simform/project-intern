import pytest
from django.urls import reverse
from rest_framework import status
from social.models import Follow

pytestmark = pytest.mark.django_db


class TestFollowView:
    def test_follow_user_creates_follow_entry(self, auth_client, user, another_user):
        """Test POST /api/posts/follow/<username>/ creates a Follow entry."""
        url = reverse("follow-view", kwargs={"username": another_user.username})
        response = auth_client.post(url)

        assert response.status_code == status.HTTP_201_CREATED
        assert Follow.objects.filter(follower=user, following=another_user).exists()

    def test_follow_response_contains_follower_and_following(self, auth_client, user, another_user):
        """Test follow POST response serializes the Follow object."""
        url = reverse("follow-view", kwargs={"username": another_user.username})
        response = auth_client.post(url)

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["follower"] == user.id
        assert response.data["following"] == another_user.id

    def test_follow_self_fails(self, auth_client, user):
        """Test user cannot follow themselves."""
        url = reverse("follow-view", kwargs={"username": user.username})
        response = auth_client.post(url)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Can not follow yourself" in response.data["detail"]

    def test_follow_already_following_fails(self, auth_client, user, another_user):
        """Test cannot create duplicate follow relationship."""
        Follow.objects.create(follower=user, following=another_user)

        url = reverse("follow-view", kwargs={"username": another_user.username})
        response = auth_client.post(url)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Already following this user" in response.data["detail"]

    def test_follow_nonexistent_user_returns_404(self, auth_client):
        """Test following a non-existent user returns 404."""
        url = reverse("follow-view", kwargs={"username": "nonexistentuser"})
        response = auth_client.post(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_follow_requires_authentication(self, api_client, another_user):
        """Test follow endpoint requires authentication."""
        url = reverse("follow-view", kwargs={"username": another_user.username})
        response = api_client.post(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_unfollow_user_deletes_follow_entry(self, auth_client, user, another_user):
        """Test DELETE /api/posts/follow/<username>/ removes a Follow entry."""
        Follow.objects.create(follower=user, following=another_user)

        url = reverse("follow-view", kwargs={"username": another_user.username})
        response = auth_client.delete(url)

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Follow.objects.filter(follower=user, following=another_user).exists()

    def test_unfollow_not_following_returns_404(self, auth_client, another_user):
        """Test unfollow returns 404 if not currently following."""
        url = reverse("follow-view", kwargs={"username": another_user.username})
        response = auth_client.delete(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert "You are not following this user" in response.data["detail"]

    def test_unfollow_nonexistent_user_returns_404(self, auth_client):
        """Test unfollowing a non-existent user returns 404."""
        url = reverse("follow-view", kwargs={"username": "nonexistentuser"})
        response = auth_client.delete(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_unfollow_requires_authentication(self, api_client, another_user):
        """Test unfollow endpoint requires authentication."""
        url = reverse("follow-view", kwargs={"username": another_user.username})
        response = api_client.delete(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_follow_and_unfollow_flow(self, auth_client, user, another_user):
        """Test follow then unfollow flow."""
        url = reverse("follow-view", kwargs={"username": another_user.username})

        # Follow
        follow_response = auth_client.post(url)
        assert follow_response.status_code == status.HTTP_201_CREATED
        assert Follow.objects.filter(follower=user, following=another_user).exists()

        # Unfollow
        unfollow_response = auth_client.delete(url)
        assert unfollow_response.status_code == status.HTTP_204_NO_CONTENT
        assert not Follow.objects.filter(follower=user, following=another_user).exists()

    def test_multiple_users_can_follow_same_user(self, auth_client, user, another_user, db):
        """Test multiple users can follow the same user."""
        from django.contrib.auth import get_user_model
        from rest_framework.test import APIClient
        User = get_user_model()

        third_user = User.objects.create_user(
            username="thirduser",
            email="third@example.com",
            password="testpassword123"
        )
        third_auth_client = APIClient()
        third_auth_client.force_authenticate(user=third_user)

        url_user1 = reverse("follow-view", kwargs={"username": another_user.username})
        url_user3 = reverse("follow-view", kwargs={"username": another_user.username})

        # User 1 follows another_user
        response1 = auth_client.post(url_user1)
        assert response1.status_code == status.HTTP_201_CREATED

        # User 3 follows another_user
        response3 = third_auth_client.post(url_user3)
        assert response3.status_code == status.HTTP_201_CREATED

        # Verify both follows exist
        assert Follow.objects.filter(follower=user, following=another_user).exists()
        assert Follow.objects.filter(follower=third_user, following=another_user).exists()
