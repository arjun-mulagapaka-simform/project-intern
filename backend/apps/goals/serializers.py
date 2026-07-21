from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from goals.models import *
from rest_framework import status


class StreakSerializer(serializers.ModelSerializer):
    """
    Serializer class for Streak model. Exposes only current streak,\n
    longest streak, and status of streak.
    """
    goal = serializers.CharField(source = "goal.description", read_only = True)
    class Meta:
        model = StreakState
        fields = ["goal", "current_streak", "longest_streak", "status"]
        extra_kwargs = {
            "current_streak": {"read_only": True},
            "longest_streak": {"read_only": True},
            "status": {"read_only": True},
        }

class GoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Goal
        exclude = ["id"]
        extra_kwargs = {
            "user": {"read_only": True},
            "is_active": {"read_only": True},
            "created_at": {"read_only": True},
            "archived_at": {"read_only": True},
        }
    
    def validate(self, attrs):
        self.validated_data = super().validate(attrs)
        if self.validated_data['cadence'] != 'n_times_per_week' and self.validated_data['target_count'] is not None:
            raise ValidationError(detail="Choose valid frequency for goal", code=status.HTTP_400_BAD_REQUEST)