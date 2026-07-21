from rest_framework import serializers
from goals.models import *


class StreakSerializer(serializers.ModelSerializer):
    """
    Serializer class for Streak model. Exposes only current streak,\n
    longest streak, and status of streak.
    """

    class Meta:
        model = StreakState
        fields = ["goal", "current_streak", "longest_streak", "status"]
        extra_kwargs = {
            "goal": {"read_only": True},
            "current_streak": {"read_only": True},
            "longest_streak": {"read_only": True},
            "status": {"read_only": True},
        }
