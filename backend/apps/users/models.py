from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    avatar = models.ImageField(upload_to="avatar/")
    bio = models.TextField(max_length=150, blank=True)
    created_at = models.DateField(auto_now_add=True)

    class Meta:
        db_table = 'Users'