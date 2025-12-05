from rest_framework import serializers
from apps.repairs.models import Repair


from apps.accounts.serializers.account_user_details import AccountUserDetailsSerializer
from apps.tech.serializers.product_model import ProductModelSerializer
from apps.repairs.serializers.issue import IssueSerializer

class RepairSerializer(serializers.ModelSerializer):
    client = AccountUserDetailsSerializer(read_only=True)
    client_id = serializers.IntegerField(write_only=True)
    product_model = ProductModelSerializer(read_only=True)
    product_model_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    issues = serializers.StringRelatedField(many=True, read_only=True)
    issue_ids = serializers.PrimaryKeyRelatedField(
        many=True, write_only=True, queryset=Repair.issues.rel.model.objects.all(), source='issues', required=False
    )
    # Make payment fields writable for updates
    card_payment = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    cash_payment = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    totalCost = serializers.DecimalField(source='price', max_digits=10, decimal_places=2, read_only=True)
    brand = serializers.CharField(source='product_model.brand.name', read_only=True)
    model = serializers.CharField(source='product_model.name', read_only=True)
    deviceType = serializers.CharField(source='product_model.device_type.name', read_only=True)
    scheduledDate = serializers.DateField(source='scheduled_date', required=False, allow_null=True)
    # Make status field writable to allow status updates
    status = serializers.ChoiceField(choices=Repair.STATUS_CHOICES, required=False)
    class Meta:
        model = Repair
        fields = [
            'id', 'uid', 'date', 'scheduledDate', 'accessories', 'client', 'client_id', 'product_model', 'product_model_id',
            'description', 'password', 'price', 'totalCost', 'card_payment', 'cash_payment',
            'comment', 'device_photo', 'file', 'created_at', 'updated_at',
            'issues', 'issue_ids', 'brand', 'model', 'deviceType', 'status',
        ]
