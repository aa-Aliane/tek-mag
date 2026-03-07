from django.db import models
from django.utils.translation import gettext_lazy as _


class StockItem(models.Model):
    STATUS_CHOICES = [
        ("available", _("Available")),
        ("reserved", _("Reserved (On Hold)")),
        ("installed", _("Installed/Sold")),
        ("defective", _("Defective/RMA")),
    ]

    product_variant = models.ForeignKey(
        "tech.ProductVariant",
        on_delete=models.CASCADE,
        related_name="stock_items",
        verbose_name=_("product variant"),
    )

    slot = models.ForeignKey(
        "stock.StorageSlot",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="stock_items",
        verbose_name=_("storage slot"),
    )

    status = models.CharField(
        _("status"), max_length=20, choices=STATUS_CHOICES, default="available"
    )

    serial_number = models.CharField(
        _("serial number"),
        max_length=255,
        blank=True,
        null=True,
        unique=True,
    )

    used_in_repair = models.ForeignKey(
        "repairs.Repair",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="installed_products",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("stock item")
        verbose_name_plural = _("stock items")

    def __str__(self):
        return (
            f"{self.product_variant.sku} - {self.slot.code if self.slot else 'No Slot'}"
        )

    def mark_as_installed(self, repair_object):
        """Helper method to handle the installation logic"""
        self.status = "installed"
        self.used_in_repair = repair_object
        self.save()
