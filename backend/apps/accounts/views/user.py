from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from ..models import Profile, User
from ..serializers import UserSerializer


class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer

    def get_queryset(self):
        queryset = User.objects.all().select_related("profile").order_by("username")
        role_name = self.request.query_params.get("role_name", None)
        if role_name is not None:
            # Check if the role_name is a valid type from Profile.TYPE_CHOICES
            valid_types = [choice[0] for choice in Profile.TYPE_CHOICES]
            if role_name in valid_types:
                queryset = queryset.filter(profile__type=role_name)
            else:
                queryset = User.objects.none()  # Return empty queryset if role doesn't exist
        return queryset

    @action(detail=False, methods=["get"])
    def all(self, request):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'count': queryset.count(),
            'next': None,
            'previous': None,
            'results': serializer.data
        })

    @action(detail=True, methods=["post"])
    def set_role(self, request, pk=None):
        user = self.get_object()
        role_name = request.data.get("role_name")

        if not role_name:
            return Response(
                {"detail": "role_name is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        valid_types = [choice[0] for choice in Profile.TYPE_CHOICES]
        if role_name not in valid_types:
            return Response(
                {"detail": "Invalid role_name"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            profile, created = Profile.objects.get_or_create(user=user)
            profile.type = role_name  # Assign the role_name to the 'type' field
            profile.save()
            return Response(
                {"status": f"role set to {role_name}"}, status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=["post"])
    def create_carrier(self, request):
        serializer = self.get_serializer(
            data=request.data, context={"is_carrier_creation": True}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
