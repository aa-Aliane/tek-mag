from apps.repairs.models import Payment
from rest_framework import serializers


class PaymentSerializer(serializers.ModelSerializer):
    method_display = serializers.CharField(source="get_method_display", read_only=True)
    transaction_type_display = serializers.CharField(
        source="get_transaction_type_display", read_only=True
    )
    created_by_name = serializers.CharField(
        source="created_by.get_full_name", read_only=True
    )

    class Meta:
        model = Payment
        fields = "__all__"
        read_only_fields = ["created_at", "created_by", "repair"]
