from rest_framework.serializers import ModelSerializer, ValidationError

from social.models import *


class FollowSerializer(ModelSerializer):
    class Meta:
        model = Follow
        fields = ["follower", "following"]
        extra_kwargs = {
            "follower": {"read_only": True},
            "following": {"read_only": True},
        }

    def validate(self, attrs):
        follower = attrs.get("follower")
        following = attrs.get("following")

        if follower == following:
            raise ValidationError(detail = "Can not follow yourself")

        return attrs
