from rest_framework import viewsets
from django_filters import rest_framework as filters
from rest_framework import filters as drf_filters
from apps.repairs.models.repair import RepairIssue
from apps.repairs.serializers.repair_issue import RepairIssueSerializer


class RepairIssueFilter(filters.FilterSet):
    repair_id = filters.NumberFilter(field_name='repair__id')
    issue_id = filters.NumberFilter(field_name='issue__id')

    class Meta:
        model = RepairIssue
        fields = {
            'repair_id': ['exact'],
            'issue_id': ['exact'],
        }


class RepairIssueViewSet(viewsets.ModelViewSet):
    queryset = RepairIssue.objects.all()
    serializer_class = RepairIssueSerializer
    filter_backends = [filters.DjangoFilterBackend, drf_filters.SearchFilter]
    filterset_class = RepairIssueFilter
    search_fields = ['notes']