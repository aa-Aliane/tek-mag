from django.db import models
from apps.tech.models import DeviceType
from apps.tech.models import ProductModel  # Import ProductModel instead of a generic Product


class Issue(models.Model):
    name = models.CharField(max_length=255)
    device_types = models.ManyToManyField(DeviceType, related_name='issues', blank=True)
    requires_part = models.BooleanField(default=False)  # Backward compatibility
    base_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # New fields for enhanced categorization
    ISSUE_CATEGORY_CHOICES = [
        ('product_based', 'Product-Based Issue (with Part)'),
        ('service_based', 'Service-Based Issue (without Defined Part)'),
    ]
    category_type = models.CharField(max_length=20, choices=ISSUE_CATEGORY_CHOICES, default='service_based')
    
    # Link to specific product/part for product-based issues
    associated_product = models.ForeignKey(
        ProductModel,  # Using ProductModel instead of a generic Product table
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='issues',
        help_text="Associated product/part for product-based issues"
    )

    def __str__(self):
        return self.name