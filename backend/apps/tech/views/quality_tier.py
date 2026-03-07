from apps.tech.filters import QualityTierFilter
from apps.tech.models import QualityTier
from apps.tech.serializers import QualityTierSerializer
from django_filters import rest_framework as filters
from rest_framework import filters as drf_filters
from rest_framework import viewsets


class QualityTierViewSet(viewsets.ModelViewSet):
    queryset = QualityTier.objects.all()
    serializer_class = QualityTierSerializer
    pagination_class = None
    filter_backends = [filters.DjangoFilterBackend, drf_filters.SearchFilter]
    filterset_class = QualityTierFilter
