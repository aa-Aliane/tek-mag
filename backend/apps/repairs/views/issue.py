from apps.repairs.models import Issue, LaborPrice
from apps.repairs.serializers import IssueSerializer, LaborPriceSerializer
from rest_framework import viewsets


class IssueViewSet(viewsets.ModelViewSet):
    """List of services offered (e.g., Screen Replacement)."""

    queryset = Issue.objects.all()
    serializer_class = IssueSerializer


class LaborPriceViewSet(viewsets.ModelViewSet):
    queryset = LaborPrice.objects.all()
    serializer_class = LaborPriceSerializer
