from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend
from ..models import ProductModel
from ..serializers import ProductModelSerializer

class ProductModelViewSet(viewsets.ModelViewSet):
    queryset = ProductModel.objects.all()
    serializer_class = ProductModelSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['brand']
