from rest_framework import viewsets
from django.db.models import Q
from django_filters import rest_framework as filters
from rest_framework import filters as drf_filters
from apps.repairs.models import Issue
from apps.repairs.serializers.issue import IssueSerializer


class IssueFilter(filters.FilterSet):
    device_types = filters.CharFilter(method='filter_by_device_types')

    def filter_by_device_types(self, queryset, name, value):
        # Filter issues that have the specified device type in their ManyToMany relationship
        return queryset.filter(device_types__slug=value)

    class Meta:
        model = Issue
        fields = ['name', 'requires_part']


class IssueViewSet(viewsets.ModelViewSet):
    queryset = Issue.objects.all()
    serializer_class = IssueSerializer
    filter_backends = [filters.DjangoFilterBackend, drf_filters.SearchFilter]
    filterset_class = IssueFilter
    search_fields = ['name']
