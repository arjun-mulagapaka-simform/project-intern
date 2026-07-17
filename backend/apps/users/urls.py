from users.views import *
from django.urls import path

urlpatterns = [
    path("me/",SelfProfileView.as_view(),name="self-profile-view"),
    path("<str:username>/",PublicProfileView.as_view(),name="public-profile-view")
]
