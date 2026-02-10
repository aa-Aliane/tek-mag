from decimal import Decimal

from apps.repairs.models.repair import Repair
from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()


class Payment(models.Model):
    """
    Focuses strictly on the movement of money.
    Discounts are now handled in the Discount model.
    """

    TRANSACTION_TYPES = [
        ("payment", "Paiement"),
        ("refund", "Remboursement"),
    ]

    repair = models.ForeignKey(
        Repair, on_delete=models.CASCADE, related_name="payments"
    )
    transaction_type = models.CharField(
        max_length=20,
        choices=TRANSACTION_TYPES,
        default="payment",
        verbose_name="Type de transaction",
    )
    amount = models.DecimalField(
        max_digits=10, decimal_places=2, verbose_name="Montant"
    )
    method = models.CharField(
        max_length=20,
        choices=[
            ("cash", "Espèces"),
            ("card", "Carte bancaire"),
            ("check", "Chèque"),
            ("transfer", "Virement"),
        ],
        default="cash",
    )
    is_rounding = models.BooleanField(default=False, verbose_name="Est un arrondi")
    note = models.TextField(blank=True, null=True, verbose_name="Note")
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Enregistré par",
    )

    class Meta:
        verbose_name = "Paiement"
        verbose_name_plural = "Paiements"
        ordering = ["-created_at"]

    def __str__(self):
        type_label = self.get_transaction_type_display()
        return f"{type_label} de {self.amount}€ - {self.repair.uid}"

    def save(self, *args, **kwargs):
        # Handle Rounding Logic
        if self.is_rounding:
            if self.method == "cash":
                # Round to nearest 0.50 for cash
                self.amount = (self.amount * 2).quantize(Decimal("0.5")) / 2
            else:
                # Standard 2 decimal places for digital
                self.amount = self.amount.quantize(Decimal("0.01"))

        super().save(*args, **kwargs)
