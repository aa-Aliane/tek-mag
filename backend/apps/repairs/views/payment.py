from apps.repairs.models import Payment, Repair
from apps.repairs.serializers import PaymentSerializer
from rest_framework import permissions, viewsets


class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Return payments for the specific repair.
        Optimized with select_related for the creator's info.
        """
        return Payment.objects.select_related("created_by").filter(
            repair_id=self.kwargs["repair_pk"]
        )

    def perform_create(self, serializer):
        """
        Link payment to the repair and set the creator.
        """
        serializer.save(
            repair_id=self.kwargs["repair_pk"], created_by=self.request.user
        )
