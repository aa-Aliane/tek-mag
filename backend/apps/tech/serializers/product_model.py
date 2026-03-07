from rest_framework import serializers

from ..models import ProductModel
from .base_product import BaseProductSerializer
from .device_type import DeviceTypeSerializer
from .series import SeriesSerializer


class ProductModelSerializer(BaseProductSerializer):
    class Meta:
        model = ProductModel
        fields = "__all__"

    def to_representation(self, instance):
        representation = super().to_representation(instance)

        if instance.device_type:
            representation["device_type"] = DeviceTypeSerializer(
                instance.device_type
            ).data
        if instance.series:
            representation["series"] = SeriesSerializer(instance.series).data

        return representation
