from rest_framework import viewsets
from ..models import StoreOrder
from ..serializers import StoreOrderSerializer


class StoreOrderViewSet(viewsets.ModelViewSet):
    queryset = StoreOrder.objects.all()
    serializer_class = StoreOrderSerializer
