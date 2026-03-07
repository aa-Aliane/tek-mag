from apps.tech.models import Part
from apps.tech.serializers.part import PartSerializer
from django_filters import rest_framework as filters
from rest_framework import viewsets


class PartFilter(filters.FilterSet):
    class Meta:
        model = Part
        fields = {
            "name": ["icontains"],
            "brand": ["exact"],
            "compatible_models": ["exact"],
        }


class PartViewSet(viewsets.ModelViewSet):
    queryset = Part.objects.all()
    serializer_class = PartSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_class = PartFilter
