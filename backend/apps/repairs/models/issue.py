from django.db import models
from apps.tech.models import DeviceType
from apps.tech.models import Part


class Issue(models.Model):
    name = models.CharField(max_length=255)
    device_types = models.ManyToManyField(DeviceType, related_name='issues', blank=True)
    requires_part = models.BooleanField(default=False)
    base_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # New fields for enhanced categorization
    ISSUE_CATEGORY_CHOICES = [
        ('part_based', 'Part-Based Issue (with Part)'),
        ('service_based', 'Service-Based Issue (without Defined Part)'),
    ]
    category_type = models.CharField(max_length=20, choices=ISSUE_CATEGORY_CHOICES, default='service_based')
    
    # Link to specific part for part-based issues
    associated_part = models.ForeignKey(
        Part,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='issues',
        help_text="Associated part for part-based issues",
        verbose_name="Associated Part"
    )

    def __str__(self):
        return self.name