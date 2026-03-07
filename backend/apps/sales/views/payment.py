from apps.sales.models import Payment
from apps.sales.serializers import PaymentSerializer
from rest_framework import viewsets


class PaymentViewSet(viewsets.ModelViewSet):
    """ViewSet for managing payments."""

    queryset = Payment.objects.select_related("repair").all()
    serializer_class = PaymentSerializer
