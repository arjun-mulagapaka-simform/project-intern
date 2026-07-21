import pytest
from django.urls import reverse
from rest_framework import status
from goals.models import Goal, StreakState

pytestmark = pytest.mark.django_db


class TestTrack2StreakState:

    def test_streak_auto_created_with_correct_defaults(self, user):
        """Test StreakState auto-created with correct default values."""
        goal = Goal.objects.create(
            user=user,
            description="Daily Run",
            cadence="daily"
        )
        streak = StreakState.objects.create(goal=goal)

        assert streak.current_streak == 0
        assert streak.longest_streak == 0
        assert streak.status == "active"
        assert streak.last_checkin is None

    def test_get_streak_endpoint(self, auth_client, user):
        """Test GET /api/goals/<id>/streak returns streak information."""
        goal = Goal.objects.create(
            user=user,
            description="Read Daily",
            cadence="daily"
        )
        StreakState.objects.create(
            goal=goal,
            current_streak=5,
            longest_streak=10,
            status="active"
        )

        url = reverse("streak-view", kwargs={"pk": goal.pk})
        response = auth_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["current_streak"] == 5
        assert response.data["longest_streak"] == 10
        assert response.data["status"] == "active"

    def test_streak_endpoint_read_only_rejects_write_attempts(self, auth_client, user):
        """Test read-only streak endpoint returns 405 Method Not Allowed on write attempts."""
        goal = Goal.objects.create(
            user=user,
            description="Read Only Goal",
            cadence="daily"
        )
        StreakState.objects.create(goal=goal)

        url = reverse("streak-view", kwargs={"pk": goal.pk})

        # POST attempt
        post_res = auth_client.post(url, {"current_streak": 99})
        assert post_res.status_code == status.HTTP_405_METHOD_NOT_ALLOWED

        # PUT attempt
        put_res = auth_client.put(url, {"current_streak": 99})
        assert put_res.status_code == status.HTTP_405_METHOD_NOT_ALLOWED

        # PATCH attempt
        patch_res = auth_client.patch(url, {"current_streak": 99})
        assert patch_res.status_code == status.HTTP_405_METHOD_NOT_ALLOWED

        # DELETE attempt
        delete_res = auth_client.delete(url)
        assert delete_res.status_code == status.HTTP_405_METHOD_NOT_ALLOWED
