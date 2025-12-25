from django.db import models
from .issue import Issue


class ServicePricing(models.Model):
    PRICING_TYPE_CHOICES = [
        ('fixed', 'Fixed Price'),
        ('hourly', 'Hourly Rate'),
        ('tiered', 'Tiered Pricing'),
    ]

    COMPLEXITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]

    issue = models.ForeignKey(
        Issue,
        on_delete=models.CASCADE,
        related_name='service_pricing'
    )
    pricing_type = models.CharField(max_length=20, choices=PRICING_TYPE_CHOICES, default='fixed')
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    time_estimate_minutes = models.IntegerField(null=True, blank=True)
    complexity_level = models.CharField(max_length=20, choices=COMPLEXITY_CHOICES, default='medium')
    description_fr = models.TextField(blank=True, null=True)
    description_en = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.issue.name} - {self.get_pricing_type_display()}"