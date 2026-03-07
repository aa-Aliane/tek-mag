from apps.accounts.serializers import OrganizationSerializer
from apps.tech.models import BaseProduct
from rest_framework import serializers

from .brand import BrandSerializer


class BaseProductSerializer(serializers.ModelSerializer):

    class Meta:
        model = BaseProduct
        fields = "__all__"

    def to_representation(self, instance):

        representation = super().to_representation(instance)

        if instance.brand:
            representation["brand"] = BrandSerializer(instance.brand).data
        if instance.owner:
            representation["owner"] = OrganizationSerializer(instance.owner).data

        return representation
