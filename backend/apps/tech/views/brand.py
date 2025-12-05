from rest_framework import viewsets
from django_filters import rest_framework as filters
from rest_framework import filters as drf_filters
from ..models import Brand
from ..serializers import BrandSerializer


class BrandFilter(filters.FilterSet):
    device_type = filters.NumberFilter(method='filter_by_device_type')

    def filter_by_device_type(self, queryset, name, value):
        # Filter brands that have series associated with the specified device type
        return queryset.filter(series__device_type_id=value).distinct()

    class Meta:
        model = Brand
        fields = []


class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    filter_backends = [filters.DjangoFilterBackend, drf_filters.SearchFilter]
    filterset_class = BrandFilter
    search_fields = ['name']
