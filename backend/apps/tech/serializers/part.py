from rest_framework import serializers
from apps.tech.models import Part, Brand, ProductModel


class PartSerializer(serializers.ModelSerializer):
    brand_name = serializers.CharField(source='brand.name', read_only=True)
    model_name = serializers.CharField(source='model.name', read_only=True)

    class Meta:
        model = Part
        fields = [
            'id', 'name', 'ean13', 'sku', 'serial_number', 'image_url',
            'price', 'repair_price', 'special_price', 'other_price',
            'brand', 'brand_name', 'model', 'model_name',
            'created_at', 'updated_at'
        ]