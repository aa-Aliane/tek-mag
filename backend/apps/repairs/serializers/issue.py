from apps.repairs.models import Issue, LaborPrice
from rest_framework import serializers


class IssueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Issue
        fields = ["id", "name"]


class LaborPriceSerializer(serializers.ModelSerializer):
    class Meta:
        model = LaborPrice
        fields = ["id", "issue", "model", "fee"]
