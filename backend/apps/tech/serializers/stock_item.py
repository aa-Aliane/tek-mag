from apps.tech.serializers.product import ProductSerializer
from rest_framework import serializers
from ..models import StockItem

class StockItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    location_name = serializers.CharField(source="location.name", read_only=True)

    class Meta:
        model = StockItem
        fields = "__all__"
