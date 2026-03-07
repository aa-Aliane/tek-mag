from apps.repairs.models import Repair, RepairLineItem
from rest_framework import serializers


class RepairLineItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = RepairLineItem
        fields = ["id", "issue", "part_variant", "price_at_sale"]
        read_only_fields = ["price_at_sale"]


class RepairSerializer(serializers.ModelSerializer):

    line_items = RepairLineItemSerializer(many=True, read_only=True)

    total_price = serializers.ReadOnlyField()
    balance_due = serializers.ReadOnlyField()
    is_fully_paid = serializers.ReadOnlyField()

    class Meta:
        model = Repair
        fields = [
            "id",
            "device",
            "customer",
            "reported_issue",
            "line_items",
            "total_price",
            "balance_due",
            "is_fully_paid",
        ]
