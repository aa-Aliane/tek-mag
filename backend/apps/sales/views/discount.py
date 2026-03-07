from apps.sales.models import Discount
from apps.sales.serializers import DiscountSerializer
from rest_framework import viewsets


class DiscountViewSet(viewsets.ModelViewSet):
    """ViewSet for managing discounts."""

    queryset = Discount.objects.select_related("repair").all()
    serializer_class = DiscountSerializer
