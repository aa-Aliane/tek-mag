# apps/stock/serializers.py
from apps.tech.models import PartType
from rest_framework import serializers


class PartTypeSerializer(serializers.ModelSerializer):
    """
    Serializer for the standardized global Part Types.
    """

    class Meta:
        model = PartType
        fields = "__all__"
