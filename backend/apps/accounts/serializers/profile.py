import logging

from rest_framework import serializers

from ..models import Profile

logger = logging.getLogger(__name__)


class ProfileSerializer(serializers.ModelSerializer):
    phone_number = serializers.CharField(required=False, allow_blank=True)
    profile_picture = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Profile
        fields = (
            "id",
            "phone_number",
            "address",
            "date_of_birth",
            "profile_picture",
            "type",
        )

    def to_internal_value(self, data):
        # Handle profile_picture deletion: if an empty string is sent, treat it as None
        if "profile_picture" in data and data["profile_picture"] == "":
            data["profile_picture"] = None
        return super().to_internal_value(data)

    def update(self, instance, validated_data):
        logger.debug(
            f"ProfileSerializer update method called with validated_data: {validated_data}"
        )
        # Handle profile_picture separately
        profile_picture = validated_data.pop("profile_picture", None)
        if profile_picture is not None:
            if profile_picture == "":  # Explicitly set to None for deletion
                instance.profile_picture = None
            else:
                instance.profile_picture = profile_picture

        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
