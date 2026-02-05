from apps.repairs.models import Payment
from apps.repairs.serializers import PaymentSerializer
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response


class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Payment.objects.select_related("repair", "created_by").filter(
            repair_id=self.kwargs["repair_pk"]
        )

    def perform_create(self, serializer):
        serializer.save(
            repair_id=self.kwargs["repair_pk"], created_by=self.request.user
        )

    @action(detail=False, methods=["get"])
    def summary(self, request, repair_pk=None):
        """Get payment summary for a repair"""
        payments = self.get_queryset()
        total_paid = sum(payment.effective_amount for payment in payments)

        return Response(
            {
                "total_paid": total_paid,
                "payment_count": payments.count(),
                "payments": PaymentSerializer(payments, many=True).data,
            }
        )
