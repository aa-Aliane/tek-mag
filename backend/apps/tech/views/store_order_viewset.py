from rest_framework import viewsets
from apps.tech.models import StoreOrder
from apps.tech.serializers import StoreOrderSerializer


class StoreOrderViewSet(viewsets.ModelViewSet):
    queryset = StoreOrder.objects.all()
    serializer_class = StoreOrderSerializer
