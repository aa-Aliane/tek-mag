from apps.sales.models import Refund
from apps.sales.serializers import RefundSerializer
from rest_framework import viewsets


class RefundViewSet(viewsets.ModelViewSet):
    """ViewSet for managing refunds."""

    queryset = Refund.objects.select_related("payment__repair").all()
    serializer_class = RefundSerializer
