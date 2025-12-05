from rest_framework import serializers
from apps.tech.models import StoreOrder


class StoreOrderSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source="supplier.name", read_only=True)

    class Meta:
        model = StoreOrder
        fields = "__all__"
