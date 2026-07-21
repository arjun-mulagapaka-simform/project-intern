from django.shortcuts import render
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
    serializer_class = [GoalSerializer]
    filterset_fields = ['user']
    search_fields = ['user', 'description']

    def get_queryset(self):
        return Goal.objects.all()
    
    def perform_create(self, serializer):
        goal = super().perform_create(serializer)
        streak = StreakState.objects.create(goal = goal)
        


class StreakRetrieveView(viewsets.ReadOnlyModelViewSet):
    """
    Read only viewset for streak model.
    """

    queryset = StreakState.objects.all()
    serializer_class = StreakSerializer
