from apps.tech.filters import PartVariantFilter
from apps.tech.models import PartVariant
from apps.tech.serializers import PartVariantSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets


class PartVariantViewSet(viewsets.ModelViewSet):
    queryset = PartVariant.objects.all().select_related("part", "color", "quality_tier")
    serializer_class = PartVariantSerializer
    pagination_class = None

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_class = PartVariantFilter
