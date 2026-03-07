from apps.tech.models import Brand
from django_filters import rest_framework as filters


class BrandFilter(filters.FilterSet):
    product_type = filters.CharFilter(method="filter_by_product_type")

    # Keep the existing device_type filter for any views that still use it
    device_type = filters.NumberFilter(method="filter_by_device_type")

    def filter_by_product_type(self, queryset, name, value):
        if value == "part":
            return queryset.filter(products__part__isnull=False).distinct()
        if value == "product_model":
            return queryset.filter(products__productmodel__isnull=False).distinct()
        return queryset

    def filter_by_device_type(self, queryset, name, value):
        return queryset.filter(series__device_type_id=value).distinct()

    class Meta:
        model = Brand
        fields = []
