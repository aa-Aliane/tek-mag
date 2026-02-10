from apps.repairs.models import PartQualityTier
from apps.repairs.serializers.part_quality_tier import PartQualityTierSerializer
from rest_framework import viewsets
from rest_framework.response import Response


class PartQualityTierViewSet(viewsets.ModelViewSet):
    queryset = PartQualityTier.objects.all()
    serializer_class = PartQualityTierSerializer
    pagination_class = None  # Disable pagination for this endpoint

    def get_queryset(self):
        """
        Filters quality tiers based on the selected Model and Issue from the wizard.
        URL usage: /api/part-quality-tiers/?model_id=1&issue_id=5
        """
        queryset = PartQualityTier.objects.all()

        # Grab the IDs from the request query parameters (?model_id=X&issue_id=Y)
        model_id = self.request.query_params.get("model_id")
        issue_id = self.request.query_params.get("issue_id")

        if model_id and issue_id:
            queryset = (
                queryset.filter(
                    # 1. Look through Part to the Issue's ManyToMany (related_issues)
                    part__related_issues__id=issue_id,
                    # 2. Look through Part to the ProductModel's ManyToMany (compatible_models)
                    part__compatible_models__id=model_id,
                    # 3. Only show available stock for the wizard
                    availability_status__in=["in_stock", "low_stock"],
                )
                .select_related("part")
                .distinct()
            )

        return queryset

    def list(self, request, *args, **kwargs):
        # Override list to ensure no pagination is applied
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
