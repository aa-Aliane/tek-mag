from apps.tech.filters import BrandFilter
from apps.tech.models import Brand
from apps.tech.serializers import BrandSerializer
from django_filters import rest_framework as filters
from rest_framework import filters as drf_filters
from rest_framework import viewsets


class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    filter_backends = [filters.DjangoFilterBackend, drf_filters.SearchFilter]
    filterset_class = BrandFilter
    search_fields = ["name"]
    pagination_class = None
