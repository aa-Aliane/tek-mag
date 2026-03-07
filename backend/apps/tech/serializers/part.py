from apps.tech.models import Part
from apps.tech.serializers.product_model import ProductModelSerializer

from .base_product import BaseProductSerializer
from .part_type import PartTypeSerializer
from .product_model import ProductModelSerializer


class PartSerializer(BaseProductSerializer):

    class Meta:
        model = Part
        fields = "__all__"

    def to_representation(self, instance):
        reprentation = super().to_representation(instance)

        if instance.part_type:
            reprentation["part_type"] = PartTypeSerializer(instance.part_type).data
        if instance.compatible_models:
            reprentation["compatible_models"] = ProductModelSerializer(
                instance.compatible_models.all(), many=True
            ).data

        return reprentation
