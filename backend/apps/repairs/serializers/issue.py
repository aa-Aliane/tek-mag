from rest_framework import serializers
from apps.repairs.models import Issue, ServicePricing
from apps.tech.serializers.product_model import ProductModelSerializer
from apps.tech.models import DeviceType


class ServicePricingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServicePricing
        fields = ['id', 'pricing_type', 'base_price', 'time_estimate_minutes', 'complexity_level', 'description_fr', 'description_en']


class IssueSerializer(serializers.ModelSerializer):
    device_types = serializers.PrimaryKeyRelatedField(queryset=DeviceType.objects.all(), many=True)
    associated_product = ProductModelSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    service_pricing = ServicePricingSerializer(read_only=True, many=True)

    class Meta:
        model = Issue
        fields = [
            'id', 'name', 'device_types', 'requires_part', 'base_price', 
            'created_at', 'updated_at', 'category_type', 'associated_product', 
            'product_id', 'service_pricing'
        ]

    def create(self, validated_data):
        product_id = validated_data.pop('product_id', None)
        instance = super().create(validated_data)
        
        if product_id:
            from apps.tech.models import ProductModel
            try:
                product = ProductModel.objects.get(id=product_id)
                instance.associated_product = product
                instance.save()
            except ProductModel.DoesNotExist:
                pass  # Handle error appropriately
        
        return instance

    def update(self, instance, validated_data):
        product_id = validated_data.pop('product_id', None)
        instance = super().update(instance, validated_data)
        
        if product_id is not None:  # Allow setting to None
            from apps.tech.models import ProductModel
            if product_id:
                try:
                    product = ProductModel.objects.get(id=product_id)
                    instance.associated_product = product
                except ProductModel.DoesNotExist:
                    pass  # Handle error appropriately
            else:
                instance.associated_product = None
            instance.save()
        
        return instance