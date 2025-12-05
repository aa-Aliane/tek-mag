import logging

from dj_rest_auth.serializers import UserDetailsSerializer
from rest_framework import serializers

from ..models import Profile
from .profile import ProfileSerializer

logger = logging.getLogger(__name__)


class AccountUserDetailsSerializer(UserDetailsSerializer):
    id = serializers.IntegerField(source="pk", read_only=True)
    profile = ProfileSerializer()  # Make it writable

    class Meta(UserDetailsSerializer.Meta):
        fields = (
            "id",
            "pk",
            "username",
            "email",
            "first_name",
            "last_name",
            "profile",
        )

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        user_instance = super().update(instance, validated_data)

        # Update profile
        if profile_data:
            profile = instance.profile
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()

        return user_instance
