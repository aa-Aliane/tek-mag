from django.db import models


class Issue(models.Model):
    name = models.CharField(max_length=255, verbose_name="Issue Name")
    description = models.TextField(blank=True, verbose_name="Issue Description")

    def __str__(self):
        return self.name


class LaborPrice(models.Model):
    issue = models.ForeignKey(
        Issue,
        on_delete=models.CASCADE,
        related_name="labor_prices",
        verbose_name="Issue",
    )
    model = models.ForeignKey("tech.ProductModel", on_delete=models.CASCADE)
    fee = models.DecimalField(
        max_digits=10, decimal_places=2, verbose_name="Labor Price"
    )

    def __str__(self):
        return f"{self.issue.name}--{self.model.name}--{self.price}"
