from decimal import Decimal

from django.db import models

from .brand import Brand
from .product_model import ProductModel


# Note: Using a string reference for 'repairs.Repair' as the app/model may not be defined yet.


class Product(models.Model):
    """
    Represents a product or part for inventory and sale.
    """

    name = models.TextField(verbose_name="Product Name")
    ean13 = models.CharField(
        max_length=13, unique=True, blank=True, null=True, verbose_name="EAN-13 Barcode"
    )
    sku = models.CharField(
        max_length=100, unique=True, blank=True, null=True, verbose_name="SKU"
    )
    serial_number = models.CharField(max_length=100, blank=True, verbose_name="Serie")
    image_url = models.URLField(blank=True, verbose_name="Image URL")

    # Pricing
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
        verbose_name="Retail Price",
    )
    repair_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
        verbose_name="Repair Price",
    )
    special_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
        verbose_name="Special Price",
    )
    other_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
        verbose_name="Other Price",
    )

    # Relationships
    brand = models.ForeignKey(
        Brand,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="products",
        verbose_name="Brand",
    )
    model = models.ForeignKey(
        ProductModel,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="products",
        verbose_name="Model",
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Product"
        verbose_name_plural = "Products"
        ordering = ["name"]

    def __str__(self):
        return self.name
