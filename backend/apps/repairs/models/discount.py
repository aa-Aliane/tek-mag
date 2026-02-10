from apps.repairs.models.repair import Repair
from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()


class Discount(models.Model):
    repair = models.ForeignKey(
        Repair, on_delete=models.CASCADE, related_name="discounts"
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    reason = models.CharField(
        max_length=255
    )  # e.g., "Client fidèle", "Geste commercial"
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
