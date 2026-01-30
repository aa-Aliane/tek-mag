from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters import rest_framework as filters
from rest_framework import filters as drf_filters
from apps.repairs.models import Issue
from apps.repairs.models.part_quality_tier import PartQualityTier
from apps.repairs.models.service_pricing import ServicePricing
from apps.repairs.serializers.issue import IssueSerializer
from apps.repairs.serializers.part_quality_tier import PartQualityTierSerializer
from apps.repairs.serializers.service_pricing import ServicePricingSerializer
from django.db.models import Q


class IssueFilter(filters.FilterSet):
    device_types = filters.CharFilter(method='filter_by_device_types')
    category_type = filters.CharFilter()

    def filter_by_device_types(self, queryset, name, value):
        # Filter issues that have the specified device type in their ManyToMany relationship
        return queryset.filter(device_types__slug=value)

    class Meta:
        model = Issue
        fields = ['name', 'requires_part', 'category_type']


class IssueViewSet(viewsets.ModelViewSet):
    queryset = Issue.objects.all()
    serializer_class = IssueSerializer
    filter_backends = [filters.DjangoFilterBackend, drf_filters.SearchFilter]
    filterset_class = IssueFilter
    search_fields = ['name']
    pagination_class = None  # Disable pagination for issues to return all at once

    @action(detail=True, methods=['get'])
    def pricing_options(self, request, pk=None):
        """
        Get pricing options for a specific issue
        For part-based issues: returns available quality tiers
        For service-based issues: returns service pricing details
        """
        issue = self.get_object()
        
        if issue.category_type == 'part_based' and issue.associated_part:
            # For part-based issues, return available quality tiers for the part
            quality_tiers = PartQualityTier.objects.filter(
                part=issue.associated_part
            )
            serializer = PartQualityTierSerializer(quality_tiers, many=True)
            return Response(serializer.data)
        elif issue.category_type == 'service_based':
            # For service-based issues, return service pricing
            service_pricing = ServicePricing.objects.filter(issue=issue)
            if service_pricing.exists():
                serializer = ServicePricingSerializer(service_pricing, many=True)
                return Response(serializer.data)
            else:
                # If no specific service pricing, return the issue's base price if available
                return Response({
                    'pricing_type': 'fixed',
                    'base_price': issue.base_price,
                    'issue_id': issue.id
                })
        else:
            # For backward compatibility
            return Response({
                'pricing_type': 'fixed',
                'base_price': issue.base_price,
                'issue_id': issue.id
            })

    @action(detail=False, methods=['get'])
    def by_device_type(self, request):
        """
        Get issues filtered by device type with category information
        """
        device_type_slug = request.query_params.get('device_type_slug', None)
        
        if device_type_slug:
            issues = Issue.objects.filter(device_types__slug=device_type_slug)
            serializer = self.get_serializer(issues, many=True)
            return Response(serializer.data)
        else:
            return Response({'error': 'device_type_slug parameter is required'}, 
                          status=status.HTTP_400_BAD_REQUEST)


class PartQualityTierViewSet(viewsets.ModelViewSet):
    queryset = PartQualityTier.objects.all()
    serializer_class = PartQualityTierSerializer
    filter_backends = [filters.DjangoFilterBackend]
    filterset_fields = ['part', 'quality_tier', 'availability_status']


class ServicePricingViewSet(viewsets.ModelViewSet):
    queryset = ServicePricing.objects.all()
    serializer_class = ServicePricingSerializer
    filter_backends = [filters.DjangoFilterBackend]
    filterset_fields = ['issue', 'pricing_type', 'complexity_level']