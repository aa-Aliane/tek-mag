from apps.accounts.serializers import OrganizationSerializer
from apps.tech.models import QualityTier
from rest_framework import serializers


class QualityTierSerializer(serializers.ModelSerializer):
    """
    Serializer for the standardized global Part Types.
    """

    class Meta:
        model = QualityTier
        fields = "__all__"

    def to_representation(self, instance):

        representation = super().to_representation(instance)

        if instance.owner:
            representation["owner"] = OrganizationSerializer(instance.owner).data

        return representation
