from django.db import models
from django.contrib.auth import get_user_model
from goals.choices import StatusChoices
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()


class Goal(models.Model):
    id = models.UUIDField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    description = models.CharField()
    cadence = models.CharField(
        choices=[
            ("Daily", "daily"),
            ("Weekly", "weekly"),
            ("Custom", "n_times_per_week"),
        ],
        default="daily",
    )
    target_count = models.IntegerField(
        validators=[MinValueValidator(2), MaxValueValidator(6)]
    )  # only if cadence = n_times_per_week
    is_active = models.BooleanField(default=True)
    created_at = models.DateField(auto_now_add=True)
    archived_at = models.DateField(null=True)

    class Meta:
        db_table = "Goals"
        indexes = [models.Index(fields=["user"])]


class StreakState(models.Model):
    goal = models.OneToOneField(Goal, on_delete=models.CASCADE, primary_key=True)
    current_streak = models.IntegerField()
    longest_streak = models.IntegerField()
    last_checkin = models.DateField(null=True)
    status = models.CharField(choices=StatusChoices, default=StatusChoices["active"])
    updated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "Streak"
