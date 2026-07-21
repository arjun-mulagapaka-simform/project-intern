from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from goals.models import Goal, StreakState


class StreakSerializer(serializers.ModelSerializer):
    """
    Serializer class for Streak model. Exposes current streak,
    longest streak, status, and last checkin date.
    """
    goal = serializers.CharField(source="goal.description", read_only=True)

    class Meta:
        model = StreakState
        fields = ["goal", "current_streak", "longest_streak", "status", "last_checkin", "updated_at"]
        extra_kwargs = {
            "current_streak": {"read_only": True},
            "longest_streak": {"read_only": True},
            "status": {"read_only": True},
            "last_checkin": {"read_only": True},
            "updated_at": {"read_only": True},
        }


class GoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Goal
        fields = ["id", "user", "description", "cadence", "target_count", "is_active", "created_at", "archived_at"]
        extra_kwargs = {
            "id": {"read_only": True},
            "user": {"read_only": True},
            "is_active": {"read_only": True},
            "created_at": {"read_only": True},
            "archived_at": {"read_only": True},
        }

    def validate(self, attrs):
        cadence = attrs.get('cadence', getattr(self.instance, 'cadence', None))
        target_count = attrs.get('target_count', getattr(self.instance, 'target_count', None))

        if cadence != 'n_times_per_week' and target_count is not None:
            raise ValidationError(detail={"target_count": "Choose valid frequency for goal"})
        if cadence == 'n_times_per_week' and target_count is None:
            raise ValidationError(detail={"target_count": "Choose a custom frequency for goal"})

        return attrs

            