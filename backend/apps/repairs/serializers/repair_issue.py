from rest_framework import serializers
from apps.repairs.models.repair import RepairIssue, Repair
from apps.repairs.serializers.issue import IssueSerializer
from apps.repairs.serializers.part_quality_tier import PartQualityTierSerializer


class RepairIssueSerializer(serializers.ModelSerializer):
    issue = IssueSerializer(read_only=True)
    issue_id = serializers.IntegerField(write_only=True)
    quality_tier = PartQualityTierSerializer(read_only=True)
    quality_tier_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = RepairIssue
        fields = [
            'id', 'issue', 'issue_id', 'quality_tier', 'quality_tier_id', 
            'custom_price', 'notes', 'get_price'
        ]

    def create(self, validated_data):
        issue_id = validated_data.pop('issue_id')
        quality_tier_id = validated_data.pop('quality_tier_id', None)
        
        from apps.repairs.models import Issue
        from apps.repairs.models.part_quality_tier import PartQualityTier
        
        try:
            issue = Issue.objects.get(id=issue_id)
            validated_data['issue'] = issue
            
            if quality_tier_id:
                quality_tier = PartQualityTier.objects.get(id=quality_tier_id)
                validated_data['quality_tier'] = quality_tier
            
            return super().create(validated_data)
        except Issue.DoesNotExist:
            raise serializers.ValidationError({"issue_id": "Issue with this ID does not exist."})
        except PartQualityTier.DoesNotExist:
            raise serializers.ValidationError({"quality_tier_id": "Quality tier with this ID does not exist."})

    def update(self, instance, validated_data):
        issue_id = validated_data.pop('issue_id', None)
        quality_tier_id = validated_data.pop('quality_tier_id', None)
        
        if issue_id:
            from apps.repairs.models import Issue
            try:
                issue = Issue.objects.get(id=issue_id)
                validated_data['issue'] = issue
            except Issue.DoesNotExist:
                raise serializers.ValidationError({"issue_id": "Issue with this ID does not exist."})
        
        if quality_tier_id is not None:  # Allow setting to None
            from apps.repairs.models.part_quality_tier import PartQualityTier
            if quality_tier_id:
                try:
                    quality_tier = PartQualityTier.objects.get(id=quality_tier_id)
                    validated_data['quality_tier'] = quality_tier
                except PartQualityTier.DoesNotExist:
                    raise serializers.ValidationError({"quality_tier_id": "Quality tier with this ID does not exist."})
            else:
                validated_data['quality_tier'] = None
        
        return super().update(instance, validated_data)
