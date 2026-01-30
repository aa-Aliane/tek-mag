from rest_framework import serializers
from apps.repairs.models import Repair
from apps.repairs.models.repair import RepairIssue
from apps.repairs.serializers.repair_issue import RepairIssueSerializer
from apps.accounts.serializers.account_user_details import AccountUserDetailsSerializer
from apps.tech.serializers.product_model import ProductModelSerializer
from apps.repairs.serializers.issue import IssueSerializer


class RepairSerializer(serializers.ModelSerializer):
    client = AccountUserDetailsSerializer(read_only=True)
    client_id = serializers.IntegerField(write_only=True)
    product_model = ProductModelSerializer(read_only=True)
    product_model_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    # Replace the old issues field with the new junction model
    repair_issues = RepairIssueSerializer(many=True, read_only=True)
    repair_issue_data = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False
    )
    
    # Keep some of the original fields
    brand = serializers.CharField(source='product_model.brand.name', read_only=True)
    model = serializers.CharField(source='product_model.name', read_only=True)
    deviceType = serializers.CharField(source='product_model.device_type.name', read_only=True)
    scheduledDate = serializers.DateField(source='scheduled_date', required=False, allow_null=True)
    # Make status field writable to allow status updates
    status = serializers.ChoiceField(choices=Repair.STATUS_CHOICES, required=False)
    totalCost = serializers.DecimalField(source='price', max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = Repair
        fields = [
            'id', 'uid', 'date', 'scheduledDate', 'accessories', 'client', 'client_id', 'product_model', 'product_model_id',
            'description', 'password', 'price', 'totalCost', 'card_payment', 'cash_payment',
            'comment', 'device_photo', 'file', 'created_at', 'updated_at',
            'repair_issues', 'repair_issue_data', 'brand', 'model', 'deviceType', 'status',
        ]

    def create(self, validated_data):
        repair_issue_data = validated_data.pop('repair_issue_data', [])
        
        # Create the repair
        repair = Repair.objects.create(**validated_data)
        
        # Create repair issues
        for issue_data in repair_issue_data:
            from apps.repairs.models import Issue
            from apps.repairs.models.part_quality_tier import PartQualityTier
            
            issue_id = issue_data.get('issue_id')
            quality_tier_id = issue_data.get('quality_tier_id')
            custom_price = issue_data.get('custom_price')
            notes = issue_data.get('notes')
            
            try:
                issue = Issue.objects.get(id=issue_id)
                
                # Prepare the data for RepairIssue
                repair_issue_data_obj = {
                    'issue': issue,
                    'custom_price': custom_price,
                    'notes': notes
                }
                
                if quality_tier_id:
                    quality_tier = PartQualityTier.objects.get(id=quality_tier_id)
                    repair_issue_data_obj['quality_tier'] = quality_tier
                
                RepairIssue.objects.create(repair=repair, **repair_issue_data_obj)
                
            except (Issue.DoesNotExist, PartQualityTier.DoesNotExist) as e:
                raise serializers.ValidationError(f"Invalid data: {str(e)}")
        
        # Recalculate the total price
        repair.price = repair.calculate_total_price()
        repair.save()
        
        return repair

    def update(self, instance, validated_data):
        repair_issue_data = validated_data.pop('repair_issue_data', None)
        
        # Update repair fields
        repair = super().update(instance, validated_data)
        
        # Update repair issues if provided
        if repair_issue_data is not None:
            # Clear existing repair issues
            repair.repair_issues.all().delete()
            
            # Create new repair issues
            for issue_data in repair_issue_data:
                from apps.repairs.models import Issue
                from apps.repairs.models.part_quality_tier import PartQualityTier
                
                issue_id = issue_data.get('issue_id')
                quality_tier_id = issue_data.get('quality_tier_id')
                custom_price = issue_data.get('custom_price')
                notes = issue_data.get('notes')
                
                try:
                    issue = Issue.objects.get(id=issue_id)
                    
                    # Prepare the data for RepairIssue
                    repair_issue_data_obj = {
                        'issue': issue,
                        'custom_price': custom_price,
                        'notes': notes
                    }
                    
                    if quality_tier_id:
                        quality_tier = PartQualityTier.objects.get(id=quality_tier_id)
                        repair_issue_data_obj['quality_tier'] = quality_tier
                    
                    RepairIssue.objects.create(repair=repair, **repair_issue_data_obj)
                    
                except (Issue.DoesNotExist, PartQualityTier.DoesNotExist) as e:
                    raise serializers.ValidationError(f"Invalid data: {str(e)}")
        
        # Recalculate the total price
        repair.price = repair.calculate_total_price()
        repair.save()
        
        return repair
