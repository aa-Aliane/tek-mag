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
    queryset = Issue.objects.all().prefetch_related(
        "device_types", 
        "service_pricing", 
        "compatible_parts"
    )
    serializer_class = IssueSerializer
    filter_backends = [filters.DjangoFilterBackend, drf_filters.SearchFilter]
    filterset_class = IssueFilter
    search_fields = ['name']
    pagination_class = None  # Disable pagination for issues to return all at once

    @action(detail=True, methods=['get'])
    def pricing_options(self, request, pk=None):
        """
        Get pricing options for a specific issue
        For part-based issues: returns available quality tiers for all compatible parts
        For service-based issues: returns service pricing details
        """
        issue = self.get_object()
        model_id = request.query_params.get('model_id')
        
        if issue.category_type == 'part_based':
            # Get all parts compatible with this issue
            part_ids = list(issue.compatible_parts.values_list('id', flat=True))
            if issue.associated_part_id:
                part_ids.append(issue.associated_part_id)
            
            quality_tiers = PartQualityTier.objects.filter(part_id__in=part_ids)
            
            if model_id:
                quality_tiers = quality_tiers.filter(part__compatible_models__id=model_id)
                
            serializer = PartQualityTierSerializer(quality_tiers.distinct(), many=True)
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


class PartQualityTierFilter(filters.FilterSet):
    issue_id = filters.NumberFilter(method='filter_by_issue')
    model_id = filters.NumberFilter(method='filter_by_model')

    class Meta:
        model = PartQualityTier
        fields = ['part', 'quality_tier', 'availability_status', 'issue_id', 'model_id']

    def filter_by_issue(self, queryset, name, value):
        # Filter tiers for parts that are compatible with the given issue
        return queryset.filter(
            Q(part__issues__id=value) | Q(part__related_issues__id=value)
        ).distinct()

    def filter_by_model(self, queryset, name, value):
        # Filter tiers for parts that are compatible with the given product model
        return queryset.filter(part__compatible_models__id=value).distinct()


class PartQualityTierViewSet(viewsets.ModelViewSet):
    queryset = PartQualityTier.objects.all().select_related('part')
    serializer_class = PartQualityTierSerializer
    filter_backends = [filters.DjangoFilterBackend]
    filterset_class = PartQualityTierFilter


class ServicePricingViewSet(viewsets.ModelViewSet):
    queryset = ServicePricing.objects.all()
    serializer_class = ServicePricingSerializer
    filter_backends = [filters.DjangoFilterBackend]
    filterset_fields = ['issue', 'pricing_type', 'complexity_level']