from django.db import transaction
from rest_framework import viewsets, serializers
from goals.models import Goal, StreakState
from goals.permissions import IsGoalOwner
from goals.serializers import GoalSerializer, StreakSerializer


class GoalsViewSet(viewsets.ModelViewSet):
    """
    Viewset to get, create, update or delete a goal
    Only owner can update or delete
    """

    permission_classes = [IsGoalOwner]
    serializer_class = GoalSerializer
    filterset_fields = ["is_active"]
    search_fields = ["description"]
    ordering = ["-id"]

    def get_queryset(self):
        return Goal.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        with transaction.atomic():
            goal = serializer.save(user=self.request.user)
            StreakState.objects.create(goal=goal)

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()

    def perform_update(self, serializer):
        if serializer.instance and not serializer.instance.is_active:
            raise serializers.ValidationError("The goal is archived")
        serializer.save()


class StreakRetrieveView(viewsets.ReadOnlyModelViewSet):
    """
    Read only viewset for streak model.
    """

    queryset = StreakState.objects.select_related("goal").all()
    serializer_class = StreakSerializer

