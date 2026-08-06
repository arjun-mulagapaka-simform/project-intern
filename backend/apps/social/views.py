from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from social.models import Follow
from social.serializers import FollowSerializer
from users.models import User


class FollowView(APIView):
    """
    Follow or unfollow a user by username.
    POST creates a Follow entry, DELETE removes it.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request, username):
        following = get_object_or_404(User, username=username)

        if following == request.user:
            return Response(
                {"detail": "Can not follow yourself"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        follow, created = Follow.objects.get_or_create(
            follower=request.user, following=following
        )
        if not created:
            return Response(
                {"detail": "Already following this user"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = FollowSerializer(follow)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def delete(self, request, username):
        following = get_object_or_404(User, username=username)
        deleted, _ = Follow.objects.filter(
            follower=request.user, following=following
        ).delete()

        if not deleted:
            return Response(
                {"detail": "You are not following this user"},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(status=status.HTTP_204_NO_CONTENT)

