from apps.tech.models import PartType
from apps.tech.serializers import PartTypeSerializer
from rest_framework import viewsets


class PartTypeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PartType.objects.all()
    serializer_class = PartTypeSerializer
    pagination_class = None
