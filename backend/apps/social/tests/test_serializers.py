import pytest
from social.serializers import FollowSerializer
from social.models import Follow
from rest_framework.exceptions import ValidationError

pytestmark = pytest.mark.django_db


class TestFollowSerializer:
    def test_follow_serializer_fields_are_read_only(self, user, another_user):
        """Test FollowSerializer exposes follower and following as read-only fields."""
        follow = Follow.objects.create(follower=user, following=another_user)
        serializer = FollowSerializer(follow)
        data = serializer.data

        assert "follower" in data
        assert "following" in data
        assert data["follower"] == user.id
        assert data["following"] == another_user.id

    def test_follow_serializer_read_only_fields_ignored(self, user, another_user):
        """Test FollowSerializer read-only fields are ignored and causes validation to fail."""
        data = {
            "follower": user.id,
            "following": another_user.id,
        }
        serializer = FollowSerializer(data=data)
        assert not serializer.is_valid()
        assert "Can not follow yourself" in str(serializer.errors)

    def test_follow_serializer_validates_self_follow_on_update(self, user):
        """Test FollowSerializer validation logic prevents self-follow (when using non-read-only fields)."""
        follow = Follow.objects.create(follower=user, following=user)
        serializer = FollowSerializer(follow, data={"follower": user.id, "following": user.id})
        assert not serializer.is_valid()
        assert "Can not follow yourself" in str(serializer.errors)

    def test_follow_serializer_returns_user_ids(self, user, another_user):
        """Test FollowSerializer returns user IDs for follower and following."""
        follow = Follow.objects.create(follower=user, following=another_user)
        serializer = FollowSerializer(follow)

        assert serializer.data["follower"] == user.id
        assert serializer.data["following"] == another_user.id
