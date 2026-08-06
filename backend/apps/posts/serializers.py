from rest_framework import serializers
from django.contrib.auth import get_user_model
from goals.models import Goal
from posts.models import Post

User = get_user_model()


class PostGoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Goal
        fields = ["id", "description"]


class PostUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username"]


class PostSerializer(serializers.ModelSerializer):
    """Read serializer for posts."""

    goal = PostGoalSerializer(read_only=True)
    user = PostUserSerializer(read_only=True)

    class Meta:
        model = Post
        fields = ["id", "goal", "user", "note", "image", "posted_at"]
        read_only_fields = fields


class PostCreateSerializer(serializers.ModelSerializer):
    """Write serializer for creating posts."""

    goal_id = serializers.PrimaryKeyRelatedField(
        source="goal", queryset=Goal.objects.all(), write_only=True
    )

    class Meta:
        model = Post
        fields = ["id", "goal_id", "note", "image", "posted_at"]
        read_only_fields = ["id", "posted_at"]

    def validate(self, attrs):
        goal = attrs["goal"]
        request = self.context["request"]

        if goal.user_id != request.user.id:
            raise serializers.ValidationError({"goal_id": "You do not own this goal."})
        if not goal.is_active:
            raise serializers.ValidationError(
                {"goal_id": "Cannot post to an archived goal."}
            )

        note = attrs.get("note", "")
        image = attrs.get("image")
        if not note and not image:
            raise serializers.ValidationError(
                "A post must include a note, an image, or both."
            )

        return attrs

    def validate_image(self, value):
        if not value:
            return value
        max_size_mb = 5
        if value.size > max_size_mb * 1024 * 1024:
            raise serializers.ValidationError(
                f"Image must be smaller than {max_size_mb}MB."
            )
        allowed_types = {"image/jpeg", "image/png", "image/webp"}
        if getattr(value, "content_type", None) not in allowed_types:
            raise serializers.ValidationError(
                "Unsupported image type. Use JPEG, PNG, or WebP."
            )
        return value
