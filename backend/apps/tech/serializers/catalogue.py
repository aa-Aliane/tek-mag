from rest_framework import serializers

from ..models import BaseProduct
from .brand import BrandSerializer
from .color import ColorSerializer
from .device_type import DeviceTypeSerializer
from .part_type import PartTypeSerializer
from .quality_tier import QualityTierSerializer
from .series import SeriesSerializer


class VariantSummarySerializer(serializers.Serializer):
    id = serializers.IntegerField()
    quality_tier = QualityTierSerializer(read_only=True)
    color = ColorSerializer(read_only=True)
    storage = serializers.CharField(read_only=True)
    sku = serializers.CharField(read_only=True)
    cost_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    retail_price = serializers.DecimalField(max_digits=10, decimal_places=2)


class CatalogueItemSerializer(serializers.ModelSerializer):
    product_type = serializers.SerializerMethodField()
    subtype_data = serializers.SerializerMethodField()
    variants = serializers.SerializerMethodField()
    brand = BrandSerializer(read_only=True)

    class Meta:
        model = BaseProduct
        fields = [
            "id",
            "name",
            "brand",
            "owner",
            "is_serialized",
            "created_at",
            "updated_at",
            "product_type",
            "subtype_data",
            "variants",
        ]

    def get_product_type(self, obj):
        if hasattr(obj, "_product_type"):
            return obj._product_type

        if hasattr(obj, "part"):
            return "part"
        if hasattr(obj, "productmodel"):
            return "product_model"
        return "unknown"

    def get_subtype_data(self, obj):
        product_type = self.get_product_type(obj)

        if product_type == "part":
            part = obj.part
            return {
                "part_type": (
                    PartTypeSerializer(part.part_type).data if part.part_type else None
                ),
                "compatible_models": [m.id for m in part.compatible_models.all()],
            }

        if product_type == "product_model":
            pm = obj.productmodel
            return {
                "device_type": (
                    DeviceTypeSerializer(pm.device_type).data
                    if pm.device_type
                    else None
                ),
                "series": SeriesSerializer(pm.series).data if pm.series else None,
                "is_popular": pm.is_popular,
                "release_year": pm.release_year,
            }

        return {}

    def get_variants(self, obj):
        # Assumes prefetched 'variants' in the ViewSet queryset
        return VariantSummarySerializer(obj.variants.all(), many=True).data
