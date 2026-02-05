from decimal import Decimal

from apps.repairs.models.part_quality_tier import PartQualityTier
from apps.tech.models import ProductModel
from django.conf import settings
from django.db import models


class RepairIssue(models.Model):
    """
    Junction model to connect repairs with issues and their selected quality tiers
    """

    repair = models.ForeignKey(
        "Repair", on_delete=models.CASCADE, related_name="repair_issues"
    )
    issue = models.ForeignKey("Issue", on_delete=models.CASCADE)
    quality_tier = models.ForeignKey(
        PartQualityTier,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="Selected quality tier for part-based issues",
    )
    custom_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Custom price if different from standard pricing",
    )
    notes = models.TextField(blank=True, null=True)

    def get_price(self):
        """
        Get the price for this issue in this repair.
        Priority: custom_price > quality_tier.price > issue.base_price
        """
        if self.custom_price:
            return self.custom_price
        elif self.quality_tier:
            return self.quality_tier.price
        elif self.issue.base_price:
            return self.issue.base_price
        return Decimal("0.00")

    def __str__(self):
        return f"{self.repair.uid} - {self.issue.name}"


class Repair(models.Model):
    uid = models.CharField(max_length=255, unique=True, verbose_name="Repair UID")
    date = models.DateField(verbose_name="Repair Date")  # Date repair was registered
    scheduled_date = models.DateField(
        null=True, blank=True, verbose_name="Scheduled Date"
    )  # Date repair is scheduled for
    accessories = models.TextField(
        null=True, blank=True, verbose_name="Accessories"
    )  # Accessories provided with the repair
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
        ("terminé", "Terminé"),
    ]
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="saisie", verbose_name="Status"
    )
    product_model = models.ForeignKey(
        ProductModel,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="repairs",
        verbose_name="Product Model",
    )
    description = models.TextField(verbose_name="Description of Breakdown")
    password = models.CharField(
        max_length=255, blank=True, null=True, verbose_name="Device Password"
    )
    price = models.DecimalField(
        max_digits=10, decimal_places=2, default=Decimal("0.00"), verbose_name="Price"
    )
    remise = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
        verbose_name="Remise/Discount",
    )
    card_payment = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
        verbose_name="Card Payment",
    )
    cash_payment = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
        verbose_name="Cash Payment",
    )
    comment = models.TextField(blank=True, null=True, verbose_name="Comment")
    device_photo = models.ImageField(
        upload_to="repair_photos/", blank=True, null=True, verbose_name="Device Photo"
    )
    file = models.FileField(
        upload_to="repair_files/", blank=True, null=True, verbose_name="Attached File"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    is_in_store = models.BooleanField(default=False)

    is_successful = models.BooleanField(
        null=True, blank=True, default=None, verbose_name="Réparation réussie"
    )

    @property
    def total_paid(self):
        """Calculate total from payment records"""
        return self.payments.aggregate(
            total=models.Sum('amount')
        )['total'] or Decimal('0.00')

    @property
    def effective_price(self):
        """Calculate price after remise"""
        if self.remise:
            return max(Decimal('0.00'), self.price - self.remise)
        return self.price

    @property
    def remaining_balance(self):
        """Calculate remaining amount after payments and remise"""
        return max(Decimal('0.00'), self.effective_price - self.total_paid)

    class Meta:
        verbose_name = "Repair"
        verbose_name_plural = "Repairs"
        ordering = ["-date", "client"]

    def __str__(self):
        return f"Repair {self.uid} for {self.client.username}"

    @property
    def final_price(self):
        """Calculate final price after remise"""
        return max(Decimal("0.00"), self.price - self.remise)

    @property
    def payment_status(self):
        """Calculate payment status based on payments vs final price"""
        total_paid = self.card_payment + self.cash_payment
        final_total = self.final_price

        if total_paid >= final_total:
            return "paid"
        elif total_paid > 0:
            return "partial"
        else:
            return "unpaid"

    @property
    def remaining_balance(self):
        """Calculate remaining amount to be paid"""
        total_paid = self.card_payment + self.cash_payment
        final_total = self.final_price
        return max(Decimal("0.00"), final_total - total_paid)

    def calculate_total_price(self):
        """
        Calculate the total price for this repair based on all associated issues
        """
        total = Decimal("0.00")
        for repair_issue in self.repair_issues.all():
            total += repair_issue.get_price()
        return total

    def save(self, *args, **kwargs):
        # Update the price field when saving, but only if the object already exists
        # (related objects like repair_issues can't be accessed before the first save)
        if self.pk:
            self.price = self.calculate_total_price()
        super().save(*args, **kwargs)
