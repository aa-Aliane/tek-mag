from django.db import models

from .base_product import BaseProduct


class ProductVariant(models.Model):
    """
    The 'Flavor' of a product.
    Handles both Parts (Colors/Quality) and Devices (Colors/Grades/Storage).
    """

    # We change 'part' to 'product' and point to BaseProduct
    product = models.ForeignKey(
        BaseProduct,
        on_delete=models.CASCADE,
        related_name="variants",
        verbose_name="Product",
    )

    # From your old model
    name = models.CharField(
        max_length=255, help_text="e.g. iPhone 12 - 128GB - Black - Grade A"
    )
    description = models.TextField(blank=True)
    ean13 = models.CharField(max_length=13, unique=True, blank=True, null=True)
    sku = models.CharField(max_length=100, unique=True, blank=True, null=True)

    # Shared Attributes
    color = models.ForeignKey(
        "Color",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="variants",
    )
    quality_tier = models.ForeignKey(
        "QualityTier",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="variants",
        verbose_name="Quality/Grade",  # This handles 'Original' for parts and 'Grade A' for phones
    )

    # Device-Specific Attribute (NULL for parts)
    STORAGE_CHOICES = [
        ("64GB", "64GB"),
        ("128GB", "128GB"),
        ("256GB", "256GB"),
        ("512GB", "512GB"),
        ("1TB", "1TB"),
    ]
    storage = models.CharField(
        max_length=20,
        choices=STORAGE_CHOICES,
        null=True,
        blank=True,
        verbose_name="Storage Capacity",
    )

    # Device-Specific Attribute (NULL for parts)
    RAM_CHOICES = [
        ("2GB", "2GB"),
        ("4GB", "4GB"),
        ("6GB", "6GB"),
        ("8GB", "8GB"),
        ("12GB", "12GB"),
        ("16GB", "16GB"),
        ("32GB", "32GB"),
        ("64GB", "64GB"),
    ]

    ram = models.CharField(max_length=10, choices=RAM_CHOICES, null=True, blank=True)

    # Financials
    cost_price = models.DecimalField(max_digits=10, decimal_places=2)
    retail_price = models.DecimalField(max_digits=10, decimal_places=2)

    @property
    def stock_quantity(self):
        # This will count StockItems (with or without IMEIs)
        return self.stock_items.count()

    @property
    def margin(self):
        return self.retail_price - self.cost_price

    def __str__(self):
        # Dynamic string: includes storage if it exists (for phones)
        storage_str = f" - {self.storage}" if self.storage else ""
        return f"{self.product.name}{storage_str} - {self.quality_tier} ({self.color})"
