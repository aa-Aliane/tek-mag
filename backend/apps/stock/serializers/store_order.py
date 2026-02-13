from rest_framework import serializers

from ..models import StoreOrder
from .supplier import SupplierSerializer


class StoreOrderSerializer(serializers.ModelSerializer):
    supplier = SupplierSerializer(read_only=True)

    # We define these with camelCase names directly or let BaseCamelCaseSerializer handle them
    # For SerializerMethodFields, the key in to_representation will be the method name minus 'get_'
    # which is already snake_case usually.

    actual_delivery_date = serializers.SerializerMethodField()
    total_price = serializers.SerializerMethodField()
    down_payment = serializers.SerializerMethodField()
    order_status = serializers.SerializerMethodField()
    tracking_number = serializers.SerializerMethodField()
    reference = serializers.SerializerMethodField()
    order_name = serializers.SerializerMethodField()
    url = serializers.SerializerMethodField()
    ordered_by = serializers.SerializerMethodField()

    class Meta:
        model = StoreOrder
        fields = "__all__"
        read_only_fields = ("created_at", "updated_at", "order_date")

    def get_actual_delivery_date(self, obj):
        return None

    def get_total_price(self, obj):
        return "0.00"

    def get_down_payment(self, obj):
        return "0.00"

    def get_order_status(self, obj):
        return "pending"

    def get_tracking_number(self, obj):
        return ""

    def get_reference(self, obj):
        return ""

    def get_order_name(self, obj):
        return f"Order for {obj.supplier.name}" if obj.supplier else "Order"

    def get_url(self, obj):
        return ""

    def get_ordered_by(self, obj):
        return 1
