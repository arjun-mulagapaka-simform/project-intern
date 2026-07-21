import pytest
from goals.serializers import GoalSerializer, StreakSerializer
from goals.models import Goal, StreakState

pytestmark = pytest.mark.django_db


class TestGoalSerializer:
    def test_daily_cadence_valid_without_target_count(self):
        """Test daily cadence is valid when target_count is None."""
        data = {
            "description": "Daily Meditation",
            "cadence": "daily",
        }
        serializer = GoalSerializer(data=data)
        assert serializer.is_valid(), serializer.errors
        assert serializer.validated_data["cadence"] == "daily"
        assert serializer.validated_data.get("target_count") is None

    def test_weekly_cadence_valid_without_target_count(self):
        """Test weekly cadence is valid when target_count is None."""
        data = {
            "description": "Weekly Reading",
            "cadence": "weekly",
        }
        serializer = GoalSerializer(data=data)
        assert serializer.is_valid(), serializer.errors
        assert serializer.validated_data["cadence"] == "weekly"

    def test_custom_cadence_valid_with_target_count(self):
        """Test n_times_per_week cadence is valid when target_count is provided."""
        data = {
            "description": "Gym 3 times a week",
            "cadence": "n_times_per_week",
            "target_count": 3,
        }
        serializer = GoalSerializer(data=data)
        assert serializer.is_valid(), serializer.errors
        assert serializer.validated_data["target_count"] == 3

    def test_custom_cadence_invalid_without_target_count(self):
        """Test n_times_per_week cadence is invalid without target_count."""
        data = {
            "description": "Gym n times",
            "cadence": "n_times_per_week",
        }
        serializer = GoalSerializer(data=data)
        assert not serializer.is_valid()

    def test_daily_cadence_invalid_with_target_count(self):
        """Test daily cadence is invalid if target_count is provided."""
        data = {
            "description": "Invalid daily with target_count",
            "cadence": "daily",
            "target_count": 2,
        }
        serializer = GoalSerializer(data=data)
        assert not serializer.is_valid()


class TestStreakSerializer:
    def test_streak_serializer_fields(self, user):
        """Test StreakSerializer exposes goal, current_streak, longest_streak, status, last_checkin."""
        goal = Goal.objects.create(
            user=user,
            description="Test Goal",
            cadence="daily"
        )
        streak = StreakState.objects.create(
            goal=goal,
            current_streak=3,
            longest_streak=5,
            status="active"
        )
        serializer = StreakSerializer(streak)
        data = serializer.data
        assert "goal" in data
        assert data["current_streak"] == 3
        assert data["longest_streak"] == 5
        assert data["status"] == "active"
        assert "last_checkin" in data
