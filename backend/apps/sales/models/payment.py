from django.db import models


class Payment(models.Model):
    PAYMENT_METHODS = [
        ("cash", "Cash"),
        ("card", "Credit/Debit Card"),
        ("transfer", "Bank Transfer"),
        ("online", "Online Payment"),
    ]

    amount = models.DecimalField(max_digits=10, decimal_places=2)
    method = models.CharField(max_length=20, choices=PAYMENT_METHODS)

    repair = models.ForeignKey(
        "repairs.Repair", on_delete=models.CASCADE, related_name="payments"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.method.upper()} - {self.amount} (Repair #{self.repair.id})"
