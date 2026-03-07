from django.db import models


class Color(models.Model):
    name = models.CharField(max_length=50, verbose_name="Color Name")

    owner = models.ForeignKey(
        "accounts.Organization",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="custom_colors",
    )

    class Meta:
        unique_together = ("name", "owner")

    def __str__(self):
        return f"{self.name} ({'Global' if not self.owner else 'Private'})"
