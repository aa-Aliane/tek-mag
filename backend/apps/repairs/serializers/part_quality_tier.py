from apps.repairs.models.part_quality_tier import PartQualityTier
from apps.tech.serializers.part import PartSerializer
from rest_framework import serializers


class PartQualityTierSerializer(serializers.ModelSerializer):
    part = PartSerializer(read_only=True)

    class Meta:
        model = PartQualityTier
        fields = [
            "id",
            "part",
            "quality_tier",
            "price",
            "warranty_days",
            "availability_status",
            "description_fr",
            "description_en",
        ]
