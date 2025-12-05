from django.db import models
from django.utils.translation import gettext_lazy as _


class StockItem(models.Model):
    product = models.ForeignKey(
        "tech.Product",
        on_delete=models.CASCADE,
        related_name="stock_items",
        verbose_name=_("product"),
    )
    location = models.ForeignKey(
        "tech.Location",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="stock_items",
        verbose_name=_("location"),
    )
    quantity = models.PositiveIntegerField(_("quantity"), default=0)
    serial_number = models.CharField(
        _("serial number"), max_length=255, blank=True, null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("stock item")
        verbose_name_plural = _("stock items")

    def __str__(self):
        return f"{self.product} - {self.location}"
