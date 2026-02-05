from django.db import models
from decimal import Decimal
from django.contrib.auth import get_user_model
from apps.repairs.models.repair import Repair

User = get_user_model()


class Payment(models.Model):
    """Individual payment record with discount/rounding support"""
    repair = models.ForeignKey(Repair, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Montant payé")
    method = models.CharField(
        max_length=20, 
        choices=[
            ('cash', 'Espèces'),
            ('card', 'Carte bancaire'),
            ('check', 'Chèque'),
            ('transfer', 'Virement'),
        ],
        default='cash'
    )
    note = models.TextField(blank=True, null=True, verbose_name="Note")
    remise_type = models.CharField(
        max_length=20,
        choices=[
            ('percentage', 'Pourcentage'),
            ('fixed', 'Montant fixe'),
            ('none', 'Aucune'),
        ],
        default='none',
        verbose_name="Type de remise"
    )
    remise_value = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=Decimal('0.00'),
        verbose_name="Valeur de la remise"
    )
    is_rounding = models.BooleanField(
        default=False,
        verbose_name="Est un arrondi"
    )
    original_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        verbose_name="Montant original avant remise/arrondi"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        verbose_name="Créé par"
    )

    class Meta:
        verbose_name = "Paiement"
        verbose_name_plural = "Paiements"
        ordering = ['-created_at']

    def __str__(self):
        return f"Paiement de {self.amount}€ pour {self.repair.uid}"

    @property
    def effective_amount(self):
        """Calculate effective amount after discount"""
        if self.remise_type == 'percentage':
            discount_amount = self.amount * (self.remise_value / Decimal('100'))
            return self.amount - discount_amount
        elif self.remise_type == 'fixed':
            return max(Decimal('0.00'), self.amount - self.remise_value)
        return self.amount

    def save(self, *args, **kwargs):
        # Store original amount before any calculations
        if not self.original_amount and self.remise_type != 'none':
            self.original_amount = self.amount
            
        # Auto-calculate rounding logic
        if self.is_rounding:
            # Round to nearest 0.50 for cash payments
            if self.method == 'cash':
                self.amount = (self.amount * 2).quantize(Decimal('0.5')) / 2
            else:
                # Round to 2 decimal places for other methods
                self.amount = self.amount.quantize(Decimal('0.01'))
        
        super().save(*args, **kwargs)