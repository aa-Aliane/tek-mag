from rest_framework import serializers
from apps.repairs.models.product_quality_tier import ProductQualityTier
from apps.tech.serializers.product_model import ProductModelSerializer


class ProductQualityTierSerializer(serializers.ModelSerializer):
    product = ProductModelSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = ProductQualityTier
        fields = [
            'id', 'product', 'product_id', 'quality_tier', 'price', 
            'warranty_days', 'availability_status', 'description_fr', 
            'description_en', 'created_at', 'updated_at'
        ]

    def create(self, validated_data):
        product_id = validated_data.pop('product_id')
        from apps.tech.models import ProductModel
        try:
            product = ProductModel.objects.get(id=product_id)
            validated_data['product'] = product
            return super().create(validated_data)
        except ProductModel.DoesNotExist:
            raise serializers.ValidationError({"product_id": "Product with this ID does not exist."})