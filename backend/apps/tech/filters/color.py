from apps.tech.models import Color
from apps.tech.serializers import ColorSerializer
from django_filters import rest_framework as filters
from rest_framework import viewsets


class ColorFilter(filters.FilterSet):
    # Scope colors to only those that appear in variants of a given product type.
    # ?product_type=part          → colors used on Part variants
    # ?product_type=product_model → colors used on ProductModel variants
    product_type = filters.CharFilter(method="filter_by_product_type")

    def filter_by_product_type(self, queryset, name, value):
        if value == "part":
            return queryset.filter(variants__product__part__isnull=False).distinct()
        if value == "product_model":
            return queryset.filter(
                variants__product__productmodel__isnull=False
            ).distinct()
        return queryset

    class Meta:
        model = Color
        fields = []


class ColorViewSet(viewsets.ModelViewSet):
    queryset = Color.objects.filter(owner=None)  # global only in the catalogue
    serializer_class = ColorSerializer
    pagination_class = None
    filter_backends = [filters.DjangoFilterBackend]
    filterset_class = ColorFilter
