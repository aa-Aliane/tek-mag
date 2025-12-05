from django.db import models

class Brand(models.Model):
    """
    Represents a product brand or manufacturer.
    """
    name = models.CharField(max_length=100, unique=True, verbose_name="Brand Name")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Brand"
        verbose_name_plural = "Brands"
        ordering = ["name"]

    def __str__(self):
        return self.name
