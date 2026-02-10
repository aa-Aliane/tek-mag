from apps.repairs.models import Discount
from apps.repairs.serializers import DiscountSerializer
from rest_framework import permissions, viewsets


class DiscountViewSet(viewsets.ModelViewSet):
    queryset = Discount.objects.all()
    serializer_class = DiscountSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None  # Disable pagination for this endpoint

    def get_queryset(self):
        """
        Return discounts for the specific repair.
        Optimized with select_related for the creator's info.
        """
        return Discount.objects.select_related("created_by").filter(
            repair_id=self.kwargs["repair_pk"]
        )

    def perform_create(self, serializer):
        """
        Link discount to the repair and set the creator.
        """
        serializer.save(
            repair_id=self.kwargs["repair_pk"], created_by=self.request.user
        )
