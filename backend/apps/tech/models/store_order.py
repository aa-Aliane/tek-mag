from django.db import models
from django.utils.translation import gettext_lazy as _


class StoreOrder(models.Model):
    STATUS_CHOICES = [
        ("pending", _("Pending")),
        ("ordered", _("Ordered")),
        ("received", _("Received")),
        ("cancelled", _("Cancelled")),
    ]

    supplier = models.ForeignKey(
        "tech.Supplier",
        on_delete=models.CASCADE,
        related_name="store_orders",
        verbose_name=_("supplier"),
    )
    status = models.CharField(
        _("status"), max_length=20, choices=STATUS_CHOICES, default="pending"
    )
    order_date = models.DateTimeField(_("order date"), auto_now_add=True)
    expected_delivery_date = models.DateField(
        _("expected delivery date"), null=True, blank=True
    )
    notes = models.TextField(_("notes"), blank=True)

    # Assuming items would be a ManyToMany or a separate OrderItem model.
    # For now, keeping it simple as per initial requirement, but typically orders have line items.
    # I will add a JSONField or just keep it basic for now.
    # Let's add a items text field for simple description if no OrderItem model is requested yet.
    items_description = models.TextField(_("items description"), blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("store order")
        verbose_name_plural = _("store orders")

    def __str__(self):
        return f"Order #{self.id} - {self.supplier}"
