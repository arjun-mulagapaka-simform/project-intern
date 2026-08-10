from rest_framework import viewsets

from posts.models import Post
from posts.permissions import IsPostOwner
from posts.serializers import PostCreateSerializer, PostSerializer


class PostViewSet(viewsets.ModelViewSet):
    """
    Viewset to list, retrieve, create, or delete posts.
    Only the author can delete their post; posts are not editable after creation.
    """

    permission_classes = [IsPostOwner]
    http_method_names = ["get", "post", "delete", "head", "options"]
    filterset_fields = ["user", "goal"]

    def get_queryset(self):
        return Post.objects.select_related("goal", "user").all()

    def get_serializer_class(self):
        if self.action == "create":
            return PostCreateSerializer
        return PostSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
