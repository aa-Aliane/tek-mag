from apps.repairs.models.service_pricing import ServicePricing
from apps.repairs.serializers.issue import IssueSerializer
from rest_framework import fields, serializers


class ServicePricingSerializer(serializers.ModelSerializer):
    issue = IssueSerializer(read_only=True)
    issue_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = ServicePricing
        fields = "__all__"

    def create(self, validated_data):
        issue_id = validated_data.pop("issue_id")
        from apps.repairs.models import Issue

        try:
            issue = Issue.objects.get(id=issue_id)
            validated_data["issue"] = issue
            return super().create(validated_data)
        except Issue.DoesNotExist:
            raise serializers.ValidationError(
                {"issue_id": "Issue with this ID does not exist."}
            )

