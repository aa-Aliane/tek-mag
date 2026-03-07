from decimal import Decimal

from django.db import models


class Repair(models.Model):
    device = models.ForeignKey(
        "tech.ProductModel",
        on_delete=models.PROTECT,
        related_name="repairs",
        verbose_name="Device",
    )
    customer = models.ForeignKey("accounts.Profile", on_delete=models.CASCADE)
    reported_issue = models.ForeignKey("Issue", on_delete=models.SET_NULL, null=True)

    @property
    def total_price(self):
        """Gross Total: Sum of all parts and labor."""
        return sum(item.price_at_sale for item in self.line_items.all()) or Decimal(
            "0.00"
        )

    @property
    def discount_amount(self):
        """Calculates the total reduction from a linked discount."""
        if hasattr(self, "discount"):
            return self.discount.calculate_amount(self.total_price)
        return Decimal("0.00")

    @property
    def net_total(self):
        """What the customer actually owes (Total - Discount)."""
        return self.total_price - self.discount_amount

    @property
    def total_paid(self):
        """Sum of all payments minus any refunds."""
        payments = self.payments.all()
        total_in = sum(p.amount for p in payments)

        total_out = sum(refund.amount for p in payments for refund in p.refunds.all())
        return total_in - total_out

    @property
    def balance_due(self):
        """The remaining amount to be paid."""
        return self.net_total - self.total_paid

    @property
    def is_fully_paid(self):
        """Quick check for the UI."""
        return self.balance_due <= 0


class RepairLineItem(models.Model):
    repair = models.ForeignKey(
        Repair, related_name="line_items", on_delete=models.CASCADE
    )
    issue = models.ForeignKey("Issue", on_delete=models.PROTECT, null=True, blank=True)

    part_variant = models.ForeignKey(
        "tech.ProductVariant", on_delete=models.PROTECT, null=True, blank=True
    )

    price_at_sale = models.DecimalField(max_digits=10, decimal_places=2)

    def save(self, *args, **kwargs):

        if not self.price_at_sale:
            total = 0

            if self.issue:
                from .issue import LaborPrice

                labor_entry = LaborPrice.objects.filter(
                    issue=self.issue, model=self.repair.device
                ).first()
                total += labor_entry.fee if labor_entry else 0

            if self.part_variant:
                total += self.part_variant.retail_price

            self.price_at_sale = total
