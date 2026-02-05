from django.db import models

from .user import User


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    
    # Legacy address field for backward compatibility
    address = models.TextField(blank=True, null=True)
    
    # Enhanced structured location fields
    street_address = models.CharField(max_length=255, blank=True, null=True, verbose_name="Street Address")
    city = models.CharField(max_length=100, blank=True, null=True, verbose_name="City")
    postal_code = models.CharField(max_length=20, blank=True, null=True, verbose_name="Postal Code")
    country = models.CharField(max_length=100, blank=True, null=True, default="France", verbose_name="Country")
    state_province = models.CharField(max_length=100, blank=True, null=True, verbose_name="State/Province")
    
    # Geolocation coordinates
    latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True, verbose_name="Latitude")
    longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True, verbose_name="Longitude")
    timezone = models.CharField(max_length=50, default="Europe/Paris", verbose_name="Timezone")
    
    # Service area for mobile repairs
    service_radius_km = models.PositiveIntegerField(default=0, verbose_name="Service Radius (km)")
    is_mobile_service_available = models.BooleanField(default=False, verbose_name="Mobile Service Available")
    
    date_of_birth = models.DateField(blank=True, null=True)
    profile_picture = models.ImageField(
        upload_to="profile_pics/", blank=True, null=True
    )
    qr_code = models.ImageField(
        upload_to="qr_codes/%Y/%m/", blank=True, null=True, verbose_name="QR Code"
    )

    TYPE_CHOICES = [
        ("Client", "Client"),
        ("Staff", "Staff"),
        ("Admin", "Admin"),
    ]

    type = models.CharField(max_length=50, choices=TYPE_CHOICES, default="Admin")

    def __str__(self):
        return f"{self.user.username} Profile"
    
    @property
    def full_address(self):
        """Return formatted full address"""
        if self.street_address and self.city and self.postal_code:
            return f"{self.street_address}, {self.postal_code} {self.city}, {self.country}"
        return self.address or ""
    
    def save(self, *args, **kwargs):
        # Auto-populate legacy address field for backward compatibility
        if self.street_address or self.city or self.postal_code:
            self.address = self.full_address
        super().save(*args, **kwargs)
