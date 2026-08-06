import pytest
from django.urls import reverse
from rest_framework import status
from posts.models import Post

pytestmark = pytest.mark.django_db


class TestPostCreate:

    def test_create_post_with_note_only(self, auth_client, user, goal):
        url = reverse("post-list")
        payload = {"goal_id": goal.id, "note": "Finished my run!"}
        response = auth_client.post(url, payload, format="json")
        assert response.status_code == status.HTTP_201_CREATED, response.data

        post = Post.objects.filter(user=user, goal=goal).first()
        assert post is not None
        assert post.note == "Finished my run!"

    def test_create_post_with_image_only(self, auth_client, user, goal, dummy_image):
        url = reverse("post-list")
        payload = {"goal_id": goal.id, "image": dummy_image()}
        response = auth_client.post(url, payload, format="multipart")
        assert response.status_code == status.HTTP_201_CREATED, response.data

        post = Post.objects.filter(user=user, goal=goal).first()
        assert post is not None
        assert post.image

    def test_create_post_requires_note_or_image(self, auth_client, goal):
        url = reverse("post-list")
        response = auth_client.post(url, {"goal_id": goal.id}, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_create_post_sets_user_from_request_not_payload(self, auth_client, user, another_user, goal):
        """The `user` field isn't accepted as input; it must come from the requester."""
        url = reverse("post-list")
        payload = {"goal_id": goal.id, "note": "Sneaky", "user": another_user.id}
        response = auth_client.post(url, payload, format="json")
        assert response.status_code == status.HTTP_201_CREATED, response.data

        post = Post.objects.get(pk=response.data["id"])
        assert post.user == user

    def test_create_post_rejects_other_users_goal(self, auth_client, another_users_goal):
        url = reverse("post-list")
        payload = {"goal_id": another_users_goal.id, "note": "Not mine"}
        response = auth_client.post(url, payload, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "goal_id" in response.data

    def test_create_post_rejects_archived_goal(self, auth_client, archived_goal):
        url = reverse("post-list")
        payload = {"goal_id": archived_goal.id, "note": "Too late"}
        response = auth_client.post(url, payload, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "goal_id" in response.data

    def test_create_post_rejects_oversized_image(self, auth_client, goal, oversized_image):
        url = reverse("post-list")
        payload = {"goal_id": goal.id, "image": oversized_image()}
        response = auth_client.post(url, payload, format="multipart")
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "image" in response.data

    def test_create_post_rejects_unsupported_image_type(self, auth_client, goal, unsupported_type_image):
        url = reverse("post-list")
        payload = {"goal_id": goal.id, "image": unsupported_type_image()}
        response = auth_client.post(url, payload, format="multipart")
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "image" in response.data


class TestPostListAndRetrieve:

    def test_list_posts(self, auth_client, user, another_user, goal, another_users_goal):
        Post.objects.create(user=user, goal=goal, note="Mine")
        Post.objects.create(user=another_user, goal=another_users_goal, note="Theirs")

        url = reverse("post-list")
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK

    def test_retrieve_post_nested_representation(self, auth_client, user, goal):
        post = Post.objects.create(user=user, goal=goal, note="Detail check")
        url = reverse("post-detail", kwargs={"pk": post.pk})
        response = auth_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["note"] == "Detail check"
        assert response.data["goal"] == {"id": goal.id, "description": goal.description}
        assert response.data["user"] == {"id": user.id, "username": user.username}


class TestPostPermissions:

    def test_delete_own_post(self, auth_client, user, goal):
        post = Post.objects.create(user=user, goal=goal, note="Delete me")
        url = reverse("post-detail", kwargs={"pk": post.pk})
        response = auth_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Post.objects.filter(pk=post.pk).exists()

    def test_delete_other_users_post_forbidden(self, auth_client, another_user, another_users_goal):
        post = Post.objects.create(user=another_user, goal=another_users_goal, note="Not yours")
        url = reverse("post-detail", kwargs={"pk": post.pk})
        response = auth_client.delete(url)
        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert Post.objects.filter(pk=post.pk).exists()

    def test_update_not_allowed(self, auth_client, user, goal):
        """Posts are create/delete only; PUT and PATCH are disabled at the viewset level."""
        post = Post.objects.create(user=user, goal=goal, note="Immutable")
        url = reverse("post-detail", kwargs={"pk": post.pk})

        put_response = auth_client.put(url, {"note": "Edited"}, format="json")
        assert put_response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED

        patch_response = auth_client.patch(url, {"note": "Edited"}, format="json")
        assert patch_response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED
