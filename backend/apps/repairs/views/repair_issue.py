from apps.repairs.models.repair import RepairIssue
from apps.repairs.serializers.repair_issue import RepairIssueSerializer
from django_filters import rest_framework as filters
from rest_framework import filters as drf_filters
from rest_framework import viewsets


class RepairIssueFilter(filters.FilterSet):
    # We use 'repair' instead of 'repair_id' to stay consistent with DRF naming
    repair = filters.NumberFilter(field_name="repair__id")
    issue = filters.NumberFilter(field_name="issue__id")

    class Meta:
        model = RepairIssue
        # Using a list for 'fields' is cleaner when you don't need complex lookups like __gt
        fields = ["repair", "issue"]


class RepairIssueViewSet(viewsets.ModelViewSet):
    queryset = RepairIssue.objects.all()
    serializer_class = RepairIssueSerializer
    filter_backends = [filters.DjangoFilterBackend, drf_filters.SearchFilter]
    filterset_class = RepairIssueFilter
    search_fields = ["notes", "issue__name"]  # Added issue name to search

    def get_queryset(self):
        """
        1. Filters by repair_pk if using nested routes.
        2. Uses select_related to avoid N+1 queries on the 'issue' and 'quality_tier'.
        """
        queryset = RepairIssue.objects.select_related("issue", "quality_tier")

        repair_pk = self.kwargs.get("repair_pk")
        if repair_pk:
            return queryset.filter(repair_id=repair_pk)

        return queryset

    def perform_create(self, serializer):
        """
        Automatically link the issue to the repair if using nested routes.
        """
        repair_pk = self.kwargs.get("repair_pk")
        if repair_pk:
            serializer.save(repair_id=repair_pk)
        else:
            serializer.save()
