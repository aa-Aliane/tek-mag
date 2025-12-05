from django.db import models

from .brand import Brand
from .device_type import DeviceType


class Series(models.Model):

    name = models.CharField(max_length=100)  # "Galaxy S", "Galaxy A", "iPhone Pro"
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE, related_name="series")
    description = models.TextField(blank=True)
    device_type = models.ForeignKey(
        DeviceType, on_delete=models.CASCADE, related_name="series"
    )
    market_segment = models.CharField(
        max_length=20,
        choices=[
            ("BUDGET", "Budget"),
            ("MID_RANGE", "Mid-Range"),
            ("FLAGSHIP", "Flagship"),
            ("PREMIUM", "Premium"),
        ],
        blank=True,
    )

    class Meta:
        verbose_name_plural = "Series"
        unique_together = ["name", "brand"]
