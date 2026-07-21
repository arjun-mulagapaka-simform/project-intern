from django.db import transaction
from rest_framework import viewsets
from goals.models import *
from goals.permissions import IsGoalOwner
from goals.serializers import *
from goals.models import *


class GoalsViewSet(viewsets.ModelViewSet):
    """
    Viewset to get, create, update or delete a goal
    Only owner can update or delete
    """

    permission_classes = [IsGoalOwner]
    serializer_class = GoalSerializer
    filterset_fields = ["user"]
    search_fields = ["user", "description"]

    def get_queryset(self):
        return Goal.objects.all()

    def perform_create(self, serializer):
        with transaction.atomic():
            goal = serializer.save(user=self.request.user)
            StreakState.objects.create(goal=goal)

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()

    def perform_update(self, serializer):
        if serializer.is_active == False:
            raise ValidationError("The goal is archived")
        serializer.save()


class StreakRetrieveView(viewsets.ReadOnlyModelViewSet):
    """
    Read only viewset for streak model.
    """

    queryset = StreakState.objects.all()
    serializer_class = StreakSerializer
