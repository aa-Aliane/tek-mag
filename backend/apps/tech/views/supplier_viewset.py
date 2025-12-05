from rest_framework import viewsets
from apps.tech.models import Supplier
from apps.tech.serializers import SupplierSerializer


class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
