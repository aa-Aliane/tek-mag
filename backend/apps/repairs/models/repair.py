

from django.db import models
from django.conf import settings
from apps.tech.models import ProductModel
from decimal import Decimal

class Repair(models.Model):
    uid = models.CharField(max_length=255, unique=True, verbose_name="Repair UID")
    date = models.DateField(verbose_name="Repair Date")  # Date repair was registered
    scheduled_date = models.DateField(null=True, blank=True, verbose_name="Scheduled Date")  # Date repair is scheduled for
    accessories = models.TextField(null=True, blank=True, verbose_name="Accessories")  # Accessories provided with the repair
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="repairs",
        verbose_name="Client",
    )

    # Repair status matching frontend statusConfig
    STATUS_CHOICES = [
        ("saisie", "Saisie"),
        ("en-cours", "En cours"),
        ("prete", "Prête"),
        ("en-attente", "En attente"),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="saisie", verbose_name="Status")
    product_model = models.ForeignKey(
        ProductModel,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="repairs",
        verbose_name="Product Model",
    )
    description = models.TextField(verbose_name="Description of Breakdown")
    password = models.CharField(max_length=255, blank=True, null=True, verbose_name="Device Password")
    price = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"), verbose_name="Price")
    card_payment = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"), verbose_name="Card Payment")
    cash_payment = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"), verbose_name="Cash Payment")
    comment = models.TextField(blank=True, null=True, verbose_name="Comment")
    device_photo = models.ImageField(upload_to="repair_photos/", blank=True, null=True, verbose_name="Device Photo")
    file = models.FileField(upload_to="repair_files/", blank=True, null=True, verbose_name="Attached File")

    issues = models.ManyToManyField("repairs.Issue", blank=True, related_name="repairs", verbose_name="Issues")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Repair"
        verbose_name_plural = "Repairs"
        ordering = ["-date", "client"]

    def __str__(self):
        return f"Repair {self.uid} for {self.client.username}"
