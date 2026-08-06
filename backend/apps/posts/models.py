from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Post(models.Model):
    """
    Model class for user posts.\n
    X-like model where user can either just tweet or\n
    just add an image or both.
    """

    goal = models.ForeignKey(
        "goals.Goal", on_delete=models.CASCADE, related_name="post"
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="post")
    note = models.TextField(max_length=250, blank=True)
    image = models.ImageField(upload_to="posts/",null=True)
    posted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "Posts"
        indexes = [
            models.Index(fields=["user", "posted_at"]),
            models.Index(fields=["goal"]),
        ]
        ordering = ['-posted_at']