from rest_framework import viewsets
from django_filters import rest_framework as filters
from apps.tech.models import Part
from apps.tech.serializers.part import PartSerializer


class PartFilter(filters.FilterSet):
    class Meta:
        model = Part
        fields = {
            'name': ['icontains'],
            'brand': ['exact'],
            'model': ['exact'],
            'sku': ['exact'],
            'ean13': ['exact'],
        }


class PartViewSet(viewsets.ModelViewSet):
    queryset = Part.objects.all()
    serializer_class = PartSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_class = PartFilter