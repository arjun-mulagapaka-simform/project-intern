from django.db import models
from goals.choices import StatusChoices

class StreakState(models.Model):
    goal = models.OneToOneField(
        Goal,
        on_delete=models.CASCADE,
        primary_key=True)
    current_streak = models.IntegerField()
    longest_streak = models.IntegerField()
    last_checkin = models.DateField(null=True)
    status = models.CharField(choices=StatusChoices, default=StatusChoices['active'])
    updated_at = models.DateTimeField(auto_now_add=True)

