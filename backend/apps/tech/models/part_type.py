from django.db import models


class PartType(models.Model):
    """
    Standardized list of types (e.g., Screen, Battery, Camera).
    """

    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name
