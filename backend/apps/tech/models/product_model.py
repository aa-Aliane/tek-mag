from django.db import models

from .brand import Brand
from .series import Series


class ProductModel(models.Model):
    """
    Represents a specific model of a product, linked to a brand.
    e.g., 'iPhone 14' for the 'Apple' brand.
    """

    name = models.CharField(max_length=100, verbose_name="Model Name")
    brand = models.ForeignKey(
        Brand, on_delete=models.CASCADE, related_name="models", verbose_name="Brand"
    )
    series = models.ForeignKey(
        Series,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="models",
        verbose_name="Series",
    )
    is_popular = models.BooleanField(default=False, verbose_name="Is Popular Model")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Product Model"
        verbose_name_plural = "Product Models"
        ordering = ["brand", "name"]
        unique_together = [["brand", "name"]]

    def __str__(self):
        return f"{self.brand.name} {self.name}"
