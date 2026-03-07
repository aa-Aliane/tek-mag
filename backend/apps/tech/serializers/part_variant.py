from apps.tech.models import PartVariant
from rest_framework import serializers

from .color import ColorSerializer
from .quality_tier import QualityTierSerializer


class PartVariantSerializer(serializers.ModelSerializer):

    class Meta:
        model = PartVariant
        fields = "__all__"

    def to_representation(self, instance):
        representation = super().to_representation(instance)

        if instance.quality_tier:
            representation["quality_tier"] = QualityTierSerializer(
                instance.quality_tier
            ).data

        if instance.color:
            representation["color"] = ColorSerializer(instance.color).data

        return representation
