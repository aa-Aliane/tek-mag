from apps._common.pagination import OptionalPagination
from apps.tech.filters import ProductVariantFilter  # The filter class we just discussed
from apps.tech.models import ProductVariant
from apps.tech.serializers import ProductVariantSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.response import Response


class ProductVariantViewSet(viewsets.ModelViewSet):
    """
    The main engine for the Catalogue.
    Handles both the 'Stock Pièces' and 'Rachat Reprise' data.
    """

    serializer_class = ProductVariantSerializer

    # PERFORMANCE: select_related prevents the "N+1" problem where
    # the database is hit for every single row to find the Brand name.
    queryset = (
        ProductVariant.objects.all()
        .select_related("product", "product__brand", "color", "quality_tier")
        .prefetch_related("product__owner")
    )

    # Integration with your Fucking Good UX filters
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ProductVariantFilter

    pagination_class = OptionalPagination

    # SEARCH: This is what makes the Catalogue search bar work.
    # It looks through the Parent Product name AND the Brand name.
    search_fields = ["product__name", "product__brand__name", "sku", "ean13", "name"]

    ordering_fields = ["retail_price", "cost_price", "product__name", "created_at"]
    ordering = ["product__name"]

    def perform_create(self, serializer):
        """
        Optional: If you want to automatically link the product owner
        to the person who created this variant.
        """
        serializer.save()

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        # Attempt to paginate the results
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        # FALLBACK: If pagination returns None, serialize the queryset directly.
        # This prevents the 'NoneType' object is not iterable error.
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
