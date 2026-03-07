# product_model.py
from django.db import models

from .base_product import BaseProduct


class ProductModel(BaseProduct):
    # This links to the DeviceType model you just showed me
    device_type = models.ForeignKey(
        "DeviceType", on_delete=models.CASCADE, related_name="models"
    )

    series = models.ForeignKey(
        "Series",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="models",
    )

    is_popular = models.BooleanField(default=False)

    release_year = models.PositiveSmallIntegerField(null=True, blank=True)

    class Meta:
        verbose_name = "Product Model"
