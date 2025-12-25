from rest_framework import serializers
from apps.repairs.models.service_pricing import ServicePricing
from apps.repairs.serializers.issue import IssueSerializer


class ServicePricingSerializer(serializers.ModelSerializer):
    issue = IssueSerializer(read_only=True)
    issue_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = ServicePricing
        fields = [
            'id', 'issue', 'issue_id', 'pricing_type', 'base_price', 
            'time_estimate_minutes', 'complexity_level', 'description_fr', 
            'description_en', 'created_at', 'updated_at'
        ]

    def create(self, validated_data):
        issue_id = validated_data.pop('issue_id')
        from apps.repairs.models import Issue
        try:
            issue = Issue.objects.get(id=issue_id)
            validated_data['issue'] = issue
            return super().create(validated_data)
        except Issue.DoesNotExist:
            raise serializers.ValidationError({"issue_id": "Issue with this ID does not exist."})