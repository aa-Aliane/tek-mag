from apps.tech.models import QualityTier
from django_filters import rest_framework as filters


class QualityTierFilter(filters.FilterSet):
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
        model = QualityTier
        fields = []
