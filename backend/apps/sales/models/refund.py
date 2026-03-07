from django.db import models


class Refund(models.Model):
    payment = models.ForeignKey(
        "Payment", on_delete=models.CASCADE, related_name="refunds"
    )
    reason = models.TextField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.amount > self.payment.amount:
            raise ValueError("Cannot refund more than the original payment.")
        super().save(*args, **kwargs)
