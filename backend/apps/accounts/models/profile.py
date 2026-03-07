from django.db import models

from .user import User


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone_number = models.CharField(max_length=20, blank=True, null=True)

    # Legacy address field for backward compatibility
    address = models.TextField(blank=True, null=True)

    # Enhanced structured location fields
    street_address = models.CharField(
        max_length=255, blank=True, null=True, verbose_name="Street Address"
    )
    city = models.CharField(max_length=100, blank=True, null=True, verbose_name="City")
    postal_code = models.CharField(
        max_length=20, blank=True, null=True, verbose_name="Postal Code"
    )
    country = models.CharField(
        max_length=100, blank=True, null=True, default="France", verbose_name="Country"
    )
    state_province = models.CharField(
        max_length=100, blank=True, null=True, verbose_name="State/Province"
    )

    date_of_birth = models.DateField(blank=True, null=True)
    profile_picture = models.ImageField(
        upload_to="profile_pics/", blank=True, null=True
    )

    TYPE_CHOICES = [
        ("Client", "Client"),
        ("Staff", "Staff"),
        ("Admin", "Admin"),
    ]

    type = models.CharField(max_length=50, choices=TYPE_CHOICES, default="Admin")

    organization = models.ForeignKey(
        "Organization",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="profiles",
    )

    def __str__(self):
        return f"{self.user.username} Profile"

    @property
    def full_address(self):
        """Return formatted full address"""
        if self.street_address and self.city and self.postal_code:
            return (
                f"{self.street_address}, {self.postal_code} {self.city}, {self.country}"
            )
        return self.address or ""

    def save(self, *args, **kwargs):
        # Auto-populate legacy address field for backward compatibility
        if self.street_address or self.city or self.postal_code:
            self.address = self.full_address
        super().save(*args, **kwargs)
