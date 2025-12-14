from rest_framework import serializers
from apps.tech.models import StoreOrder
from apps.tech.serializers import SupplierSerializer


class StoreOrderSerializer(serializers.ModelSerializer):
    # Map backend fields to frontend field names
    delivery_status = serializers.CharField(source='status', read_only=True)
    actual_delivery_date = serializers.SerializerMethodField()
    total_price = serializers.SerializerMethodField()
    down_payment = serializers.SerializerMethodField()
    order_status = serializers.SerializerMethodField()
    tracking_number = serializers.SerializerMethodField()
    reference = serializers.SerializerMethodField()
    supplier = SupplierSerializer(read_only=True)  # Nested serializer for single supplier
    order_name = serializers.SerializerMethodField()
    url = serializers.SerializerMethodField()
    ordered_by = serializers.SerializerMethodField()

    class Meta:
        model = StoreOrder
        fields = "__all__"
        read_only_fields = ('created_at', 'updated_at', 'order_date')

    def get_actual_delivery_date(self, obj):
        return None  # Placeholder, not in model

    def get_total_price(self, obj):
        return "0.00"  # Placeholder, not in model

    def get_down_payment(self, obj):
        return "0.00"  # Placeholder, not in model

    def get_order_status(self, obj):
        return "pending"  # Placeholder, not in model

    def get_tracking_number(self, obj):
        return ""  # Placeholder, not in model

    def get_reference(self, obj):
        return ""  # Placeholder, not in model

    def get_order_name(self, obj):
        return f"Order for {obj.supplier.name}" if obj.supplier else "Order"  # Placeholder

    def get_url(self, obj):
        return ""  # Placeholder, not in model

    def get_ordered_by(self, obj):
        return 1  # Placeholder, default user ID

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Convert supplier object to suppliers array for frontend compatibility
        if 'supplier' in data and data['supplier']:
            data['suppliers'] = [data['supplier']]
        else:
            data['suppliers'] = []

        # Map status to delivery_status
        if 'status' in data:
            data['delivery_status'] = data['status']

        return data
