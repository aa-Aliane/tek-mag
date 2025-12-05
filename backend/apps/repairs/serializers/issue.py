from rest_framework import serializers
from apps.repairs.models import Issue

class IssueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Issue
        fields = ['id', 'name', 'device_types', 'requires_part', 'base_price', 'created_at', 'updated_at']
