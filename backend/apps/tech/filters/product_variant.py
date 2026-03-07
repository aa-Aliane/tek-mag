# IMPORT THE MODEL, NOT THE SERIALIZER
from apps.tech.models import ProductVariant
from django_filters import rest_framework as filters


class ProductVariantFilter(filters.FilterSet):
    brand = filters.NumberFilter(field_name="product__brand__id")
    is_global = filters.BooleanFilter(field_name="product__owner", lookup_expr="isnull")
    is_device = filters.BooleanFilter(field_name="product__is_serialized")

    class Meta:
        model = ProductVariant  # Filters use Models
        fields = {
            "color": ["exact"],
            "quality_tier": ["exact"],
            "product": ["exact"],
            "storage": ["exact"],
        }
