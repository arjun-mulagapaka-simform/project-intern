from goals.serializers import *
from rest_framework import viewsets
from goals.models import *


class StreakRetrieveView(viewsets.ReadOnlyModelViewSet):
    """
    Read only viewset for streak model.
    """

    queryset = StreakState.objects.all()
    serializer_class = StreakSerializer
