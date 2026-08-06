from django.urls import path
from social.views import *

urlpatterns = [
    path("follow/<str:username>/", FollowView.as_view(), name="follow-view"),
]
