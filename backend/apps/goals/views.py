from rest_framework import viewsets, serializers, status
from rest_framework.decorators import action
from rest_framework.response import Response

from django.db import transaction

from goals.models import Goal, StreakState
from goals.permissions import IsGoalOwner
from goals.serializers import GoalSerializer, StreakSerializer

from datetime import date

class GoalsViewSet(viewsets.ModelViewSet):
    """
    Viewset to get, create, update or delete a goal
    Only owner can update or delete
    """

    permission_classes = [IsGoalOwner]
    serializer_class = GoalSerializer
    filterset_fields = ["user", "is_active"]
    search_fields = ["description"]
    ordering = ["-id"]

    def get_queryset(self):
        return Goal.objects.all()

    def perform_create(self, serializer):
        with transaction.atomic():
            goal = serializer.save(user=self.request.user)
            StreakState.objects.create(goal=goal)

    def perform_destroy(self, instance):
        with transaction.atomic():
            instance.streak.status = "broken"
            instance.is_active = False
            instance.archived_at = date.today()
            instance.save()
            instance.streak.save()

    def perform_update(self, serializer):
        if serializer.instance and not serializer.instance.is_active:
            raise serializers.ValidationError("The goal is archived")
        serializer.save()

    @action(detail=True, methods=["patch"], url_path="reactivate")
    def reactivate(self, request, pk=None):
        """
        Reactivate an archived goal and reset its streak state.
        """
        goal = self.get_object()
        with transaction.atomic():
            goal.is_active = True
            goal.save()
            goal.streak.status = 'active'
            goal.streak.current_streak = 0
            goal.streak.save()

        serializer = self.get_serializer(goal)
        return Response(serializer.data, status=status.HTTP_200_OK)


class StreakRetrieveView(viewsets.ReadOnlyModelViewSet):
    """
    Read only viewset for streak model.
    """

    queryset = StreakState.objects.select_related("goal").all()
    serializer_class = StreakSerializer
