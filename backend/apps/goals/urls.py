from django.urls import path, include
from rest_framework  import routers
from goals.views import *

router = routers.DefaultRouter()
router.register(r"goals", GoalsViewSet, basename='goal')

urlpatterns = [
    path("<int:pk>/streak", StreakRetrieveView.as_view({'get':'retrieve'}), name="streak-view"),
    path("", include(router.urls))
]