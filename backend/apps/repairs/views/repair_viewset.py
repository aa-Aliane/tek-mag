from rest_framework import viewsets
import django_filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters as drf_filters
from apps.repairs.models import Repair
from apps.repairs.serializers import RepairSerializer


class RepairFilter(django_filters.FilterSet):
    # Map frontend device types to backend device type slugs
    device_type = django_filters.CharFilter(method='filter_by_device_type')

    def filter_by_device_type(self, queryset, name, value):
        # Handle device type filtering - account for both simple slugs and CSV-imported slugs
        if not value:
            return queryset

        value_lower = value.lower()

        # Different strategies based on the value requested
        if value_lower == 'smartphone':
            # Look for slugs containing 'smartphone' or 'phone' (case-insensitive partial match)
            return queryset.filter(
                product_model__series__device_type__slug__icontains='smartphone'
            ) | queryset.filter(
                product_model__series__device_type__slug__icontains='phone'
            )
        elif value_lower == 'computer' or value_lower == 'laptop' or value_lower == 'pc':
            # Handle multiple possible terms for computers
            return queryset.filter(
                product_model__series__device_type__slug__icontains='laptop'
            ) | queryset.filter(
                product_model__series__device_type__slug__icontains='pc'
            ) | queryset.filter(
                product_model__series__device_type__slug__icontains='desktop'
            )
        elif value_lower == 'tablet':
            # Look for slugs containing 'tablet'
            return queryset.filter(
                product_model__series__device_type__slug__icontains='tablet'
            )
        elif value_lower == 'watch':
            # Look for slugs containing 'watch'
            return queryset.filter(
                product_model__series__device_type__slug__icontains='watch'
            )
        else:
            # For any other device type, try a case-insensitive partial match
            return queryset.filter(product_model__series__device_type__slug__icontains=value_lower)

    class Meta:
        model = Repair
        fields = ['status', 'client', 'date']


class RepairViewSet(viewsets.ModelViewSet):
    queryset = Repair.objects.select_related(
        'client', 'client__profile', 'product_model__brand', 'product_model__series__device_type'
    ).prefetch_related('issues')
    serializer_class = RepairSerializer
    filter_backends = [DjangoFilterBackend, drf_filters.SearchFilter]
    filterset_class = RepairFilter
    search_fields = ['uid', 'description', 'client__username', 'client__first_name', 'client__last_name', 'product_model__brand__name', 'product_model__name']
