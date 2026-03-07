from apps.tech.filters import ColorFilter
from apps.tech.models import Color
from apps.tech.serializers import ColorSerializer
from django_filters import rest_framework as filters
from rest_framework import filters as drf_filters
from rest_framework import viewsets


class ColorViewSet(viewsets.ModelViewSet):
    queryset = Color.objects.all()
    serializer_class = ColorSerializer
    pagination_class = None
    filter_backends = [filters.DjangoFilterBackend, drf_filters.SearchFilter]
    fitlerset_class = ColorFilter
