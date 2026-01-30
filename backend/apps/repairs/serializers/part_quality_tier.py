from rest_framework import serializers
from apps.repairs.models.part_quality_tier import PartQualityTier


class PartQualityTierSerializer(serializers.ModelSerializer):
    class Meta:
        model = PartQualityTier
        fields = [
            'id', 'part', 'quality_tier', 'price', 'warranty_days', 
            'availability_status', 'description_fr', 'description_en'
        ]
