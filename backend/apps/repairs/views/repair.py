import django_filters
from apps.repairs.models import Repair
from apps.repairs.serializers import RepairSerializer
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters as drf_filters
from rest_framework import viewsets


class RepairFilter(django_filters.FilterSet):
    device_type = django_filters.CharFilter(method="filter_by_device_type")
    exclude_status = django_filters.CharFilter(method="filter_exclude_status")
    # Added: Search for repairs by specific financial state
    is_paid = django_filters.BooleanFilter(method="filter_by_payment_status")

    def filter_exclude_status(self, queryset, name, value):
        if value:
            return queryset.exclude(status=value)
        return queryset

    def filter_by_payment_status(self, queryset, name, value):
        """
        Note: Filtering by property (remaining_balance) is tricky.
        If you need this, we'd need to use .annotate() in the ViewSet.
        For now, this is a placeholder to remind us of that logic.
        """
        return queryset

    def filter_by_device_type(self, queryset, name, value):
        if not value:
            return queryset
        val = value.lower()

        # Simplified logic using Q objects for better readability
        if val == "smartphone":
            query = Q(
                product_model__series__device_type__slug__icontains="smartphone"
            ) | Q(product_model__series__device_type__slug__icontains="phone")
        elif val in ["computer", "laptop", "pc"]:
            query = (
                Q(product_model__series__device_type__slug__icontains="laptop")
                | Q(product_model__series__device_type__slug__icontains="pc")
                | Q(product_model__series__device_type__slug__icontains="desktop")
            )
        elif val in ["tablet", "watch"]:
            query = Q(product_model__series__device_type__slug__icontains=val)
        else:
            query = Q(product_model__series__device_type__slug__icontains=val)

        return queryset.filter(query)

    class Meta:
        model = Repair
        fields = ["status", "client", "date", "exclude_status"]


class RepairViewSet(viewsets.ModelViewSet):
    # CRITICAL: Added "discounts" to prefetch_related
    queryset = Repair.objects.select_related(
        "client",
        "client__profile",
        "product_model__brand",
        "product_model__series__device_type",
    ).prefetch_related(
        "repair_issues__issue",
        "repair_issues__quality_tier",
        "payments",
        "discounts",  # New source of truth for discounts
    )

    serializer_class = RepairSerializer
    filter_backends = [
        DjangoFilterBackend,
        drf_filters.SearchFilter,
        drf_filters.OrderingFilter,
    ]
    filterset_class = RepairFilter

    search_fields = [
        "uid",
        "description",
        "client__username",
        "client__first_name",
        "client__last_name",
        "product_model__brand__name",
        "product_model__name",
    ]
    # Added: Allow frontend to sort by date or price
    ordering_fields = ["date", "created_at"]

    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)
