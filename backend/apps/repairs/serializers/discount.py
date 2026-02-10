from apps.repairs.models import Discount
from rest_framework import serializers


class DiscountSerializer(serializers.ModelSerializer):

    created_by_name = serializers.CharField(
        source="created_by.get_full_name", read_only=True
    )

    class Meta:
        model = Discount
        fields = "__all__"
        read_only_fields = ["created_at", "created_by"]

    def create(self, validated_data):

        request = self.context.get("request")
        if request and hasattr(request, "user"):
            validated_data["created_by"] = request.user
        return super().create(validated_data)
