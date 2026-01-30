from rest_framework import serializers
from apps.repairs.models import Issue, ServicePricing
from apps.tech.serializers.part import PartSerializer
from apps.tech.models import DeviceType


class ServicePricingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServicePricing
        fields = ['id', 'pricing_type', 'base_price', 'time_estimate_minutes', 'complexity_level', 'description_fr', 'description_en']


class IssueSerializer(serializers.ModelSerializer):
    device_types = serializers.PrimaryKeyRelatedField(queryset=DeviceType.objects.all(), many=True)
    associated_part = PartSerializer(read_only=True)
    part_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    service_pricing = ServicePricingSerializer(read_only=True, many=True)

    class Meta:
        model = Issue
        fields = [
            'id', 'name', 'device_types', 'requires_part', 'base_price', 
            'created_at', 'updated_at', 'category_type', 'associated_part', 
            'part_id', 'service_pricing'
        ]

    def create(self, validated_data):
        part_id = validated_data.pop('part_id', None)
        instance = super().create(validated_data)
        
        if part_id:
            from apps.tech.models import Part
            try:
                part = Part.objects.get(id=part_id)
                instance.associated_part = part
                instance.save()
            except Part.DoesNotExist:
                pass
        
        return instance

    def update(self, instance, validated_data):
        part_id = validated_data.pop('part_id', None)
        instance = super().update(instance, validated_data)
        
        if part_id is not None:
            from apps.tech.models import Part
            if part_id:
                try:
                    part = Part.objects.get(id=part_id)
                    instance.associated_part = part
                except Part.DoesNotExist:
                    pass
            else:
                instance.associated_part = None
            instance.save()
        
        return instance
