from apps.sales.models import Refund
from rest_framework import serializers


class RefundSerializer(serializers.ModelSerializer):
    class Meta:
        model = Refund
        fields = "__all__"
