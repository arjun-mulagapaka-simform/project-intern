from django.db import models

from users.models import User

class Follow(models.Model):
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name="followers")
    following = models.ForeignKey(User,on_delete=models.CASCADE, related_name="followings")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [("follower", "following")]
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["follower"]),
            models.Index(fields=["following"])
        ]
