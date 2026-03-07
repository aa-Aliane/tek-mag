from apps.accounts.models import Organization
from apps.accounts.serializers import OrganizationSerializer
from rest_framework import viewsets


class OrganizationViewSet(viewsets.ModelViewSet):
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer
