from decimal import Decimal

from apps.repairs.models.part_quality_tier import PartQualityTier
from apps.tech.models import ProductModel
from django.conf import settings
from django.db import models
from django.db.models import F, Q, Sum


class RepairIssue(models.Model):
    """
    Junction model to connect repairs with issues and their selected quality tiers.
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
    """
    Main Repair model. Financial totals are calculated dynamically from
    related RepairIssue, Payment, and Discount records.
    """

    uid = models.CharField(max_length=255, unique=True, verbose_name="Repair UID")
    date = models.DateField(verbose_name="Repair Date")
    scheduled_date = models.DateField(
        null=True, blank=True, verbose_name="Scheduled Date"
    )

    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="repairs",
        verbose_name="Client",
    )

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
    accessories = models.TextField(null=True, blank=True, verbose_name="Accessories")

    # Internal metadata
    comment = models.TextField(blank=True, null=True, verbose_name="Comment")
    device_photo = models.ImageField(upload_to="repair_photos/", blank=True, null=True)
    file = models.FileField(upload_to="repair_files/", blank=True, null=True)
    is_in_store = models.BooleanField(default=False)
    is_successful = models.BooleanField(null=True, blank=True, default=None)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Repair"
        verbose_name_plural = "Repairs"
        ordering = ["-date", "client"]

    def __str__(self):
        return f"Repair {self.uid} for {self.client.username}"

    # --- FINANCIAL PROPERTIES ---

    @property
    def base_price(self):
        """Total price based on all associated issues/parts before adjustments."""
        total = sum(issue.get_price() for issue in self.repair_issues.all())
        return Decimal(total).quantize(Decimal("0.01"))

    @property
    def total_discounts(self):
        """Aggregated total from the Discount model."""
        return self.discounts.aggregate(res=Sum("amount"))["res"] or Decimal("0.00")

    @property
    def total_paid(self):
        """Net total: (Payments) - (Refunds)."""
        stats = self.payments.aggregate(
            inbound=Sum("amount", filter=Q(transaction_type="payment")),
            outbound=Sum("amount", filter=Q(transaction_type="refund")),
        )
        paid = stats["inbound"] or Decimal("0.00")
        refunded = stats["outbound"] or Decimal("0.00")
        return (paid - refunded).quantize(Decimal("0.01"))

    @property
    def final_price(self):
        """What the client actually owes (Base Price - Discounts)."""
        return max(Decimal("0.00"), self.base_price - self.total_discounts)

    @property
    def remaining_balance(self):
        """Remaining debt (Final Price - Net Paid)."""
        return max(Decimal("0.00"), self.final_price - self.total_paid)

    @property
    def payment_status(self):
        """Dynamic status based on financial data."""
        paid = self.total_paid
        target = self.final_price

        if target <= 0:
            return "paid"  # No charge repairs
        if paid >= target:
            return "paid"
        if paid > 0:
            return "partial"
        return "unpaid"

    def save(self, *args, **kwargs):
        # We no longer manually set a 'price' field here.
        # The base_price property handles it dynamically to prevent sync issues.
        super().save(*args, **kwargs)
