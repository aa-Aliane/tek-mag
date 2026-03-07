from django.db import models


class Discount(models.Model):
    DISCOUNT_TYPES = [
        ("fixed", "Fixed Amount ($)"),
        ("percent", "Percentage (%)"),
    ]

    repair = models.OneToOneField(
        "repairs.Repair", on_delete=models.CASCADE, related_name="discount"
    )
    name = models.CharField(
        max_length=50, help_text="e.g., Student Discount, Black Friday"
    )
    discount_type = models.CharField(max_length=10, choices=DISCOUNT_TYPES)
    value = models.DecimalField(max_digits=10, decimal_places=2)

    def calculate_amount(self, gross_total):
        if self.discount_type == "percent":
            return (self.value / 100) * gross_total
        return self.value
