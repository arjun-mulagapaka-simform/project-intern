from django.db import models
from django.contrib.auth import get_user_model
from goals.choices import StatusChoices, CadenceChoices
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid

User = get_user_model()

class Goal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="goals")
    description = models.CharField(max_length=255)
    cadence = models.CharField(
        max_length=50,
        choices=CadenceChoices,
        default="daily",
    )
    target_count = models.IntegerField(
        validators=[MinValueValidator(2), MaxValueValidator(6)], blank=True, null=True
    )  # only if cadence = n_times_per_week
    is_active = models.BooleanField(default=True)
    created_at = models.DateField(auto_now_add=True)
    archived_at = models.DateField(null=True, blank=True)

    class Meta:
        db_table = "Goals"
        indexes = [models.Index(fields=["user", "is_active"])]


class StreakState(models.Model):
    goal = models.OneToOneField(Goal, on_delete=models.CASCADE, primary_key=True, related_name="streak")
    current_streak = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)
    last_checkin = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=StatusChoices, default=StatusChoices[0][0])
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "Streak"
