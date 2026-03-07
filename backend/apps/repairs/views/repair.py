from apps._common.pagination import OptionalPagination
from apps.repairs.models import Repair, RepairLineItem
from apps.repairs.serializers import RepairLineItemSerializer, RepairSerializer
from rest_framework import viewsets


class RepairViewSet(viewsets.ModelViewSet):
    # Performance optimization: fetch related data in one query
    queryset = Repair.objects.select_related("device", "customer").prefetch_related(
        "line_items", "payments__refunds"
    )
    serializer_class = RepairSerializer
    pagination_class = OptionalPagination


class RepairLineItemViewSet(viewsets.ModelViewSet):
    queryset = RepairLineItem.objects.all()
    serializer_class = RepairLineItemSerializer
