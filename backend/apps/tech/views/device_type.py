from apps.tech.filters import DeviceTypeFilter
from apps.tech.models import DeviceType
from apps.tech.serializers import DeviceTypeSerializer
from django_filters import rest_framework as filters
from rest_framework import filters as drf_filters
from rest_framework import viewsets


class DeviceTypeViewSet(viewsets.ModelViewSet):
    queryset = DeviceType.objects.all()
    serializer_class = DeviceTypeSerializer
    pagination_class = None
    filter_backends = [filters.DjangoFilterBackend, drf_filters.SearchFilter]
    filterset_class = DeviceTypeFilter
