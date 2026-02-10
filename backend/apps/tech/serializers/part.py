from apps.tech.models import Brand, Part, ProductModel
from apps.tech.serializers.product_model import ProductModelSerializer
from rest_framework import serializers


class PartSerializer(serializers.ModelSerializer):
    brand_name = serializers.CharField(source="brand.name", read_only=True)
    compatible_models = ProductModelSerializer(many=True, read_only=True)

    class Meta:
        model = Part
        fields = [
            "id",
            "name",
            "ean13",
            "sku",
            "serial_number",
            "image_url",
            "price",
            "repair_price",
            "special_price",
            "other_price",
            "brand",
            "brand_name",
            "compatible_models",
            "created_at",
            "updated_at",
        ]
