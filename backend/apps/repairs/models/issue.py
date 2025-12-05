from django.db import models
from apps.tech.models import DeviceType

class Issue(models.Model):
    name = models.CharField(max_length=255)
    device_types = models.ManyToManyField(DeviceType, related_name='issues', blank=True)
    requires_part = models.BooleanField(default=False)
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
