from apps.tech.models import ProductVariant
from rest_framework import serializers

from .base_product import BaseProductSerializer
from .color import ColorSerializer
from .quality_tier import QualityTierSerializer


class ProductVariantSerializer(serializers.ModelSerializer):
    # We include the product details so the frontend sees "iPhone 12"
    # and the "is_serialized" flag without extra API calls.

    class Meta:
        model = ProductVariant
        fields = "__all__"

    def to_representation(self, instance):
        representation = super().to_representation(instance)

        # 1. Expand Product/Parent Details (Name, Brand, is_serialized)
        if instance.product:
            representation["product"] = BaseProductSerializer(instance.product).data

            # Useful for flat searching in the React Table
            representation["product_name"] = instance.product.name
            representation["brand_name"] = (
                instance.product.brand.name if instance.product.brand else None
            )
            representation["is_serialized"] = instance.product.is_serialized

        # 2. Expand Quality Tier (Handles "Original" or "Grade A")
        if instance.quality_tier:
            representation["quality_tier"] = QualityTierSerializer(
                instance.quality_tier
            ).data

        # 3. Expand Color
        if instance.color:
            representation["color"] = ColorSerializer(instance.color).data

        # 4. Add the calculated margin
        representation["margin"] = instance.margin

        return representation
