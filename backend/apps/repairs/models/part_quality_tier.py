from django.db import models
from apps.tech.models import Part


class PartQualityTier(models.Model):
    QUALITY_TIER_CHOICES = [
        ('standard', 'Standard (Économique)'),
        ('premium', 'Premium (Haute Qualité)'),
        ('original', 'Original (Genuin)'),
        ('refurbished', 'Refurbished (Reconditionné)'),
    ]

    part = models.ForeignKey(
        Part,
        on_delete=models.CASCADE,
        related_name='quality_tiers',
        verbose_name="Part"
    )
    quality_tier = models.CharField(max_length=20, choices=QUALITY_TIER_CHOICES)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    warranty_days = models.IntegerField(default=90)
    availability_status = models.CharField(
        max_length=20,
        choices=[
            ('in_stock', 'In Stock'),
            ('low_stock', 'Low Stock'),
            ('out_of_stock', 'Out of Stock'),
            ('discontinued', 'Discontinued'),
        ],
        default='in_stock'
    )
    description_fr = models.TextField(blank=True, null=True)
    description_en = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Part Quality Tier"
        verbose_name_plural = "Part Quality Tiers"
        unique_together = ['part', 'quality_tier']

    def __str__(self):
        return f"{self.part.name} - {self.get_quality_tier_display()}"
