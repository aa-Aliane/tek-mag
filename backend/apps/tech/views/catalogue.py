from apps._common.pagination import OptionalPagination
from apps.tech.filters.catalogue import CatalogueFilter
from apps.tech.models import BaseProduct, ProductModel, ProductVariant
from apps.tech.serializers import CatalogueItemSerializer
from django.db.models import Prefetch
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets


class CatalogueViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CatalogueItemSerializer
    pagination_class = OptionalPagination
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_class = CatalogueFilter
    search_fields = ["name", "brand__name"]
    ordering_fields = ["name", "brand__name", "created_at"]
    ordering = ["name"]

    def get_queryset(self):
        # Filter for actual subtypes
        qs = BaseProduct.objects.filter(
            id__in=(
                BaseProduct.objects.filter(part__isnull=False)
                | BaseProduct.objects.filter(productmodel__isnull=False)
            ).values("id")
        )

        # Select related for single-row joins
        qs = qs.select_related(
            "brand",
            "owner",
            "part__part_type",
            "productmodel__device_type",
            "productmodel__series",
            "productmodel__series__device_type",
            "productmodel__series__brand",
        )

        # Prefetch for variants (chips)
        variants_prefetch = Prefetch(
            "variants",
            queryset=ProductVariant.objects.select_related(
                "quality_tier", "color"
            ).only(
                "id",
                "product_id",
                "sku",
                "quality_tier__id",
                "quality_tier__name",
                "color__id",
                "color__name",
                "storage",
                "cost_price",
                "retail_price",
            ),
        )

        # Prefetch for compatible models on Parts
        compatible_prefetch = Prefetch(
            "part__compatible_models",
            queryset=ProductModel.objects.select_related("brand", "series"),
        )

        return qs.prefetch_related(variants_prefetch, compatible_prefetch).distinct()
