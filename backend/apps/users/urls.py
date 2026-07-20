from users.views import *
from django.urls import path
from rest_framework_simplejwt.views import TokenBlacklistView, TokenRefreshView

urlpatterns = [
    path("me/",SelfProfileView.as_view(),name="self-profile-view"),
    path("<str:username>/",PublicProfileView.as_view(),name="public-profile-view"),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', TokenBlacklistView.as_view(), name='logout'),
    path('refresh/', TokenRefreshView.as_view(), name='refresh')
]