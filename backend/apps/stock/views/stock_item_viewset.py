from apps._common.pagination import OptionalPagination
from rest_framework import viewsets

from ..models import StockItem
from ..serializers import StockItemSerializer


class StockItemViewSet(viewsets.ModelViewSet):
    queryset = StockItem.objects.all()
    serializer_class = StockItemSerializer
    pagination_class = OptionalPagination
