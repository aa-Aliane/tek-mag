from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend
from ..models import ProductModel
from ..serializers import ProductModelSerializer
from rest_framework.pagination import PageNumberPagination


class NoPagination(PageNumberPagination):
    def paginate_queryset(self, queryset, request, view=None):
        return None

    def get_paginated_response(self, data):
        from rest_framework.response import Response
        return Response(data)


class ProductModelViewSet(viewsets.ModelViewSet):
    queryset = ProductModel.objects.all()
    serializer_class = ProductModelSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['brand']
    pagination_class = None  # Disable pagination
