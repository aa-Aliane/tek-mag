from apps.tech.models import BaseProduct
from django_filters import rest_framework as filters


class CatalogueFilter(filters.FilterSet):
    is_global = filters.BooleanFilter(field_name="owner", lookup_expr="isnull")
    brand = filters.NumberFilter(field_name="brand__id")

    # Part filters
    part_type = filters.NumberFilter(field_name="part__part_type__id")
    compatible_model = filters.NumberFilter(field_name="part__compatible_models__id")

    # ProductModel filters
    device_type = filters.NumberFilter(field_name="productmodel__device_type__id")
    series = filters.NumberFilter(field_name="productmodel__series__id")
    is_popular = filters.BooleanFilter(field_name="productmodel__is_popular")

    # Variant filters
    quality_tier = filters.NumberFilter(field_name="variants__quality_tier__id")
    color = filters.NumberFilter(field_name="variants__color__id")

    # Discriminator
    product_type = filters.CharFilter(method="filter_by_product_type")

    class Meta:
        model = BaseProduct
        fields = []

    def filter_by_product_type(self, queryset, name, value):
        if value == "part":
            return queryset.filter(part__isnull=False)
        if value == "product_model":
            return queryset.filter(productmodel__isnull=False)
        return queryset
