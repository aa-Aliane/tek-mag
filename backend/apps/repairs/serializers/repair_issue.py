from apps.repairs.models import Issue, RepairIssue
from apps.repairs.models.part_quality_tier import PartQualityTier
from apps.repairs.serializers.issue import IssueSerializer
from rest_framework import serializers


class RepairIssueSerializer(serializers.ModelSerializer):
    # --- READ-ONLY: For the Frontend UI ---
    issue_details = IssueSerializer(source="issue", read_only=True)
    # This calls the get_price() method we wrote in the Model
    price = serializers.DecimalField(
        source="get_price", max_digits=10, decimal_places=2, read_only=True
    )

    # --- WRITE-ONLY: For creating/updating ---
    # PrimaryKeyRelatedField automatically handles .objects.get() and validation
    issue = serializers.PrimaryKeyRelatedField(queryset=Issue.objects.all())
    quality_tier = serializers.PrimaryKeyRelatedField(
        queryset=PartQualityTier.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = RepairIssue
        # List exactly what you need. __all__ is risky here.
        fields = [
            "id",
            "repair",
            "issue",
            "issue_details",
            "quality_tier",
            "custom_price",
            "price",
            "notes",
        ]
        # Ensure repair is read-only if you're creating this through the RepairSerializer
        extra_kwargs = {"repair": {"read_only": True}}
