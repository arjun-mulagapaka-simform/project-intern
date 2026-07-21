import pytest
import uuid
from django.urls import reverse
from rest_framework import status
from goals.models import Goal, StreakState

pytestmark = pytest.mark.django_db


def get_goals_url(endpoint_name="goal-list", pk=None):
    """Helper to get URL for goals endpoint."""
    try:
        if pk:
            return reverse("goal-detail", kwargs={"pk": pk})
        return reverse("goal-list")
    except Exception:
        # Fallback to direct path if named URL pattern differs
        if pk:
            return f"/api/goals/{pk}/"
        return "/api/goals/"


class TestTrack1GoalCRUD:

    def test_create_goal_daily_cadence(self, auth_client, user):
        """Test creating a goal with 'daily' cadence and auto-created StreakState."""
        url = get_goals_url()
        payload = {
            "description": "Daily Reading",
            "cadence": "daily",
        }
        response = auth_client.post(url, payload, format="json")

        assert response.status_code in [status.HTTP_201_CREATED, status.HTTP_200_OK], response.data
        goal_id = response.data.get("id") or (Goal.objects.filter(user=user).first().id if Goal.objects.filter(user=user).exists() else None)
        assert goal_id is not None

        # Confirm StreakState row exists right after goal creation
        streak_exists = StreakState.objects.filter(goal_id=goal_id).exists()
        assert streak_exists, "StreakState row must be auto-created upon Goal creation."

    def test_create_goal_weekly_cadence(self, auth_client, user):
        """Test creating a goal with 'weekly' cadence."""
        url = get_goals_url()
        payload = {
            "description": "Weekly Swimming",
            "cadence": "weekly",
        }
        response = auth_client.post(url, payload, format="json")

        assert response.status_code in [status.HTTP_201_CREATED, status.HTTP_200_OK], response.data

    def test_create_goal_n_times_per_week_cadence(self, auth_client, user):
        """Test creating a goal with 'n_times_per_week' cadence requiring target_count."""
        url = get_goals_url()

        # Valid target_count
        payload_valid = {
            "description": "Gym Workout",
            "cadence": "n_times_per_week",
            "target_count": 4,
        }
        response_valid = auth_client.post(url, payload_valid, format="json")
        assert response_valid.status_code in [status.HTTP_201_CREATED, status.HTTP_200_OK], response_valid.data

        # Missing target_count should be rejected
        payload_invalid = {
            "description": "Gym Workout Invalid",
            "cadence": "n_times_per_week",
        }
        response_invalid = auth_client.post(url, payload_invalid, format="json")
        assert response_invalid.status_code == status.HTTP_400_BAD_REQUEST

    def test_list_own_goals_scoped_to_user(self, auth_client, user, another_auth_client, another_user):
        """Test listing goals returns only request.user's goals and supports is_active filter."""
        # Create goal for user
        g1 = Goal.objects.create(
            id=uuid.uuid4(),
            user=user,
            description="User Goal 1",
            cadence="daily",
            is_active=True
        )
        StreakState.objects.create(goal=g1)

        # Create goal for another_user
        g2 = Goal.objects.create(
            id=uuid.uuid4(),
            user=another_user,
            description="Another User Goal",
            cadence="daily",
            is_active=True
        )
        StreakState.objects.create(goal=g2)

        url = get_goals_url()
        response = auth_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        results = response.data.get("results", response.data) if isinstance(response.data, dict) else response.data

        # Ensure User B's goal is not visible to User A
        goal_ids = [str(g.get("id")) for g in results if isinstance(g, dict)]
        assert str(g2.id) not in goal_ids, "Cross-user goals must not be exposed."

    def test_list_goals_is_active_filter(self, auth_client, user):
        """Test filtering goals by ?is_active=true."""
        g_active = Goal.objects.create(
            id=uuid.uuid4(),
            user=user,
            description="Active Goal",
            cadence="daily",
            is_active=True
        )
        StreakState.objects.create(goal=g_active)

        g_archived = Goal.objects.create(
            id=uuid.uuid4(),
            user=user,
            description="Archived Goal",
            cadence="daily",
            is_active=False
        )
        StreakState.objects.create(goal=g_archived)

        url = f"{get_goals_url()}?is_active=true"
        response = auth_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        results = response.data.get("results", response.data) if isinstance(response.data, dict) else response.data
        for g in results:
            if isinstance(g, dict):
                assert g.get("is_active") is True or g.get("is_active") == "true"

    def test_no_cross_user_detail_access(self, auth_client, user, another_auth_client, another_user):
        """Test guessing/requesting another user's goal ID returns 404."""
        g_another = Goal.objects.create(
            id=uuid.uuid4(),
            user=another_user,
            description="Secret Goal",
            cadence="daily",
            is_active=True
        )
        StreakState.objects.create(goal=g_another)

        url = get_goals_url(pk=g_another.id)
        response = auth_client.get(url)

        # Scoped viewsets must return 404 for non-owned resources
        assert response.status_code in [status.HTTP_404_NOT_FOUND, status.HTTP_403_FORBIDDEN]

    def test_edit_active_goal(self, auth_client, user):
        """Test PATCH /api/goals/<id>/ edits active goal attributes."""
        goal = Goal.objects.create(
            id=uuid.uuid4(),
            user=user,
            description="Old Description",
            cadence="daily",
            is_active=True
        )
        StreakState.objects.create(goal=goal)

        url = get_goals_url(pk=goal.id)
        patch_data = {"description": "Updated Description"}
        response = auth_client.patch(url, patch_data, format="json")

        assert response.status_code == status.HTTP_200_OK
        goal.refresh_from_db()
        assert goal.description == "Updated Description"

    def test_soft_archive_goal(self, auth_client, user):
        """Test DELETE /api/goals/<id>/ performs soft archive, keeping StreakState intact."""
        goal = Goal.objects.create(
            id=uuid.uuid4(),
            user=user,
            description="Goal to archive",
            cadence="daily",
            is_active=True
        )
        streak = StreakState.objects.create(goal=goal)

        url = get_goals_url(pk=goal.id)
        response = auth_client.delete(url)

        assert response.status_code in [status.HTTP_204_NO_CONTENT, status.HTTP_200_OK]

        # Confirm soft archive (never hard delete)
        goal.refresh_from_db()
        assert goal.is_active is False
        assert goal.archived_at is not None

        # Confirm StreakState survives
        assert StreakState.objects.filter(goal=goal).exists()

    def test_archived_goal_rejects_edits(self, auth_client, user):
        """Test PATCH on an archived goal is blocked."""
        goal = Goal.objects.create(
            id=uuid.uuid4(),
            user=user,
            description="Archived Goal",
            cadence="daily",
            is_active=False
        )
        StreakState.objects.create(goal=goal)

        url = get_goals_url(pk=goal.id)
        response = auth_client.patch(url, {"description": "Attempted Edit"}, format="json")

        assert response.status_code in [status.HTTP_400_BAD_REQUEST, status.HTTP_403_FORBIDDEN]
