from django.db import models


class Location(models.Model):
    LOCATION_TYPES = [
        ("shop", "Retail Store"),
        ("warehouse", "Warehouse"),
        ("mobile", "Mobile Van/Technician"),
    ]

    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True, blank=True)
    type = models.CharField(max_length=20, choices=LOCATION_TYPES, default="shop")

    address = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=20, blank=True)

    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Physical Location"
        verbose_name_plural = "Physical Locations"

    def __str__(self):
        return self.name


class StorageSlot(models.Model):
    location = models.ForeignKey(
        Location, on_delete=models.CASCADE, related_name="slots"
    )
    code = models.CharField(max_length=50)

    is_for_parts = models.BooleanField(default=True)
    is_for_repairs = models.BooleanField(default=True)

    class Meta:
        unique_together = ("location", "code")

    def __str__(self):
        return f"{self.location.name} - {self.code}"
