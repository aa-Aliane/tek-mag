from django.db import models

from .base_product import BaseProduct
from .product_model import ProductModel


class Part(BaseProduct):
    """
    Represents a spare part (Screen, Battery, etc.).
    Inherits name, brand, and owner from BaseProduct.
    """

    part_type = models.ForeignKey(
        "PartType", on_delete=models.PROTECT, related_name="parts"
    )

    compatible_models = models.ManyToManyField(
        ProductModel,
        related_name="compatible_parts",
        verbose_name="Compatible Models",
        blank=True,
    )

    class Meta:
        verbose_name = "Part"
        verbose_name_plural = "Parts"
