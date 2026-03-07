from django.db import models

from .brand import Brand


class BaseProduct(models.Model):
    """
    The umbrella model for everything that can be in stock.
    """

    name = models.TextField(verbose_name="Product Name")

    brand = models.ForeignKey(
        Brand,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="products",
        verbose_name="Brand",
    )

    owner = models.ForeignKey(
        "accounts.Organization",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="custom_products",
    )

    # This boolean tells React: "Ask for IMEI" (True) or "Ask for Quantity" (False)
    is_serialized = models.BooleanField(
        default=False, verbose_name="Is Serialized (Phone/Laptop)"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.brand.name if self.brand else ''} {self.name}"
