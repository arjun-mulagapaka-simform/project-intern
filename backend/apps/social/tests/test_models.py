import pytest
from social.models import Follow

pytestmark = pytest.mark.django_db


class TestFollowModel:
    def test_follow_creates_with_follower_and_following(self, user, another_user):
        """Test Follow model creates with follower and following relationships."""
        follow = Follow.objects.create(follower=user, following=another_user)

        assert follow.follower == user
        assert follow.following == another_user
        assert follow.created_at is not None

    def test_follow_has_unique_together_constraint(self, user, another_user):
        """Test unique_together constraint prevents duplicate follow relationships."""
        Follow.objects.create(follower=user, following=another_user)

        with pytest.raises(Exception):
            Follow.objects.create(follower=user, following=another_user)

    def test_follow_cascade_deletes_on_follower_delete(self, user, another_user):
        """Test deleting a user cascades and deletes their Follow relationships."""
        follow = Follow.objects.create(follower=user, following=another_user)
        follow_id = follow.id

        user.delete()

        assert not Follow.objects.filter(id=follow_id).exists()

    def test_follow_cascade_deletes_on_following_delete(self, user, another_user):
        """Test deleting a user cascades and deletes Follow relationships where they're being followed."""
        follow = Follow.objects.create(follower=user, following=another_user)
        follow_id = follow.id

        another_user.delete()

        assert not Follow.objects.filter(id=follow_id).exists()

    def test_follow_ordering_by_created_at_descending(self, user, another_user, db):
        """Test Follow objects are ordered by created_at descending."""
        from django.utils import timezone
        from datetime import timedelta

        follow1 = Follow.objects.create(follower=user, following=another_user)
        follow1.created_at = timezone.now() - timedelta(days=1)
        follow1.save()

        follow2 = Follow.objects.create(
            follower=another_user,
            following=user
        )

        follows = Follow.objects.all()
        assert follows[0].id == follow2.id
        assert follows[1].id == follow1.id

    def test_follow_auto_increments_id(self, user, another_user):
        """Test Follow model uses auto-incrementing primary key."""
        follow1 = Follow.objects.create(follower=user, following=another_user)

        assert follow1.id is not None
        assert isinstance(follow1.id, int)
        assert follow1.id > 0
