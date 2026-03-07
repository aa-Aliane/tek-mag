from apps.tech.models import BaseProduct
from apps.tech.serializers import BaseProductSerializer
from rest_framework import viewsets


class BaseProductViewSet(viewsets.ModelViewSet):
    queryset = BaseProduct.objects.all()
    serializer_class = BaseProductSerializer
