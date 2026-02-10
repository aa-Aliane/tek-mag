from apps.accounts.serializers.account_user_details import AccountUserDetailsSerializer
from apps.repairs.models import Issue, Repair, RepairIssue
from apps.repairs.models.part_quality_tier import PartQualityTier
from apps.repairs.serializers.payment import PaymentSerializer
from apps.repairs.serializers.repair_issue import RepairIssueSerializer
from apps.tech.serializers.product_model import ProductModelSerializer
from django.db import transaction
from rest_framework import serializers


class RepairSerializer(serializers.ModelSerializer):
    # --- Deep Objects (Read-only) ---
    client = AccountUserDetailsSerializer(read_only=True)
    product_model = ProductModelSerializer(read_only=True)
    repair_issues = RepairIssueSerializer(many=True, read_only=True)
    payments = PaymentSerializer(many=True, read_only=True)

    # --- Flattened Display Fields ---
    brand = serializers.CharField(source="product_model.brand.name", read_only=True)
    model = serializers.CharField(source="product_model.name", read_only=True)
    deviceType = serializers.CharField(
        source="product_model.device_type.name", read_only=True
    )

    # --- Frontend Naming Compatibility ---
    scheduledDate = serializers.DateField(
        source="scheduled_date", required=False, allow_null=True
    )

    # --- Write-only Helpers for React ---
    client_id = serializers.IntegerField(write_only=True)
    product_model_id = serializers.IntegerField(
        write_only=True, required=False, allow_null=True
    )
    repair_issue_data = serializers.ListField(
        child=serializers.DictField(), write_only=True, required=False
    )

    # --- The "Logic" Fields (Properties) ---
    base_price = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )
    total_discounts = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )
    final_price = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )
    total_paid = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )
    remaining_balance = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )
    payment_status = serializers.CharField(read_only=True)

    class Meta:
        model = Repair
        fields = [
            "id",
            "uid",
            "date",
            "scheduledDate",
            "status",
            "description",
            "password",
            "accessories",
            "comment",
            "is_in_store",
            "is_successful",
            "device_photo",
            "file",
            "client",
            "client_id",
            "product_model",
            "product_model_id",
            "repair_issues",
            "repair_issue_data",
            "payments",
            "brand",
            "model",
            "deviceType",
            "base_price",
            "total_discounts",
            "final_price",
            "total_paid",
            "remaining_balance",
            "payment_status",
            "created_at",
            "updated_at",
        ]

    def _process_issues(self, repair, data):
        """Helper to sync repair issues"""
        # Clear existing issues if updating
        if repair.repair_issues.exists():
            repair.repair_issues.all().delete()

        for item in data:
            RepairIssue.objects.create(
                repair=repair,
                issue_id=item.get("issue_id"),
                quality_tier_id=item.get("quality_tier_id"),
                custom_price=item.get("custom_price"),
                notes=item.get("notes"),
            )

    @transaction.atomic
    def create(self, validated_data):
        repair_issue_data = validated_data.pop("repair_issue_data", [])
        repair = Repair.objects.create(**validated_data)
        self._process_issues(repair, repair_issue_data)
        return repair

    @transaction.atomic
    def update(self, instance, validated_data):
        repair_issue_data = validated_data.pop("repair_issue_data", None)

        # Update the repair instance
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update issues if data was provided
        if repair_issue_data is not None:
            self._process_issues(instance, repair_issue_data)

        return instance
