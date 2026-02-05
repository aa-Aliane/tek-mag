from django.db import models
from django.utils.translation import gettext_lazy as _


class Location(models.Model):
    LOCATION_TYPE_CHOICES = [
        ('warehouse', 'Warehouse'),
        ('store', 'Store'),
        ('lab', 'Lab'),
        ('service_center', 'Service Center'),
        ('client_location', 'Client Location'),
    ]

    name = models.CharField(_("name"), max_length=255)
    
    # Legacy address field for backward compatibility
    address = models.TextField(_("address"), blank=True)
    
    # Enhanced structured address
    street_address = models.CharField(_("street address"), max_length=255, blank=True)
    city = models.CharField(_("city"), max_length=100, blank=True)
    postal_code = models.CharField(_("postal code"), max_length=20, blank=True)
    country = models.CharField(_("country"), max_length=100, blank=True, default="France")
    state_province = models.CharField(_("state/province"), max_length=100, blank=True)
    
    # Geolocation
    latitude = models.DecimalField(_("latitude"), max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = models.DecimalField(_("longitude"), max_digits=9, decimal_places=6, blank=True, null=True)
    timezone = models.CharField(_("timezone"), max_length=50, default="Europe/Paris")
    
    # Service area and capabilities
    type = models.CharField(_("type"), max_length=50, choices=LOCATION_TYPE_CHOICES, blank=True)
    service_radius_km = models.PositiveIntegerField(_("service radius (km)"), default=0)
    is_pickup_location = models.BooleanField(_("is pickup location"), default=False)
    is_dropoff_location = models.BooleanField(_("is dropoff location"), default=True)
    
    # Contact information
    phone = models.CharField(_("phone"), max_length=50, blank=True)
    email = models.EmailField(_("email"), blank=True)
    
    # Operating hours (JSON format: {"monday": "09:00-18:00", ...})
    opening_hours = models.JSONField(_("opening hours"), default=dict, blank=True)
    
    # Capacity and constraints
    max_daily_repairs = models.PositiveIntegerField(_("max daily repairs"), null=True, blank=True)
    requires_appointment = models.BooleanField(_("requires appointment"), default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("location")
        verbose_name_plural = _("locations")

    def __str__(self):
        return self.name
    
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
