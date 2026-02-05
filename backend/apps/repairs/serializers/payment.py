from rest_framework import serializers
from apps.repairs.models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    effective_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id', 'amount', 'method', 'note', 'remise_type', 'remise_value',
            'is_rounding', 'original_amount', 'effective_amount', 'created_at', 'created_by'
        ]
        read_only_fields = ['created_at', 'created_by', 'original_amount']