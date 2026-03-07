from apps.tech.models import DeviceType
from django_filters import rest_framework as filters


class DeviceTypeFilter(filters.FilterSet):
    domain = filters.CharFilter(field_name="domain", lookup_expr="iexact")

    class Meta:
        model = DeviceType
        fields = []
