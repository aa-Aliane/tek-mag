from django.db import models


class QualityTier(models.Model):
    """
    Represents a quality tier for parts, such as "New", "Refurbished", "Used", etc.
    """

    name = models.CharField(
        max_length=50, unique=True, verbose_name="Quality Tier Name"
    )
    description = models.TextField(blank=True, verbose_name="Description")

    owner = models.ForeignKey(
        "accounts.Organization",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="custom_quality_tiers",
    )

    class Meta:
        unique_together = ("name", "owner")

    def __str__(self):
        return f"{self.name} ({'Global' if not self.owner else 'Private'})"
