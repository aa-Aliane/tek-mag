from django_filters import FilterSet
from django_filters.rest_framework import DjangoFilterBackend, filters
from rest_framework import viewsets

from ..models import ProductModel
from ..serializers import ProductModelSerializer


class ProductModelFilter(FilterSet):
    brand = filters.NumberFilter(field_name="brand__id")
    device_type = filters.NumberFilter(method="filter_by_device_type")

    def filter_by_device_type(self, queryset, name, value):
        # Filter models by device type through the series relationship
        # ProductModel -> Series -> DeviceType
        return queryset.filter(series__device_type_id=value).distinct()

    class Meta:
        model = ProductModel
        fields = ["brand", "device_type"]


class ProductModelViewSet(viewsets.ModelViewSet):
    queryset = ProductModel.objects.all()
    serializer_class = ProductModelSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = ProductModelFilter
    pagination_class = None
