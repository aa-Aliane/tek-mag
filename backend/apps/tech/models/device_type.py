from django.db import models


class DeviceType(models.Model):

    DOMAIN_CHOICES = [
        ("COMPUTERS", "Computers"),
        ("PHONES", "Phones"),
    ]

    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    domain = models.CharField(max_length=50, choices=DOMAIN_CHOICES)

    class Meta:
        verbose_name = "Device Type"
        verbose_name_plural = "Device Types"
        ordering = ["name"]

    def __str__(self):
        return self.name
