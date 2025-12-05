from rest_framework import viewsets
from apps.tech.models import StockItem
from apps.tech.serializers import StockItemSerializer


class StockItemViewSet(viewsets.ModelViewSet):
    queryset = StockItem.objects.all()
    serializer_class = StockItemSerializer
