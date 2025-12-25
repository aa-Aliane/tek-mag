from rest_framework.pagination import PageNumberPagination


class LargeResultsSetPagination(PageNumberPagination):
    page_size = 100
    page_size_query_param = 'page_size'
    max_page_size = 1000


class NoPagination:
    """
    A pagination class that returns all results without pagination.
    """
    def paginate_queryset(self, queryset, request, view=None):
        return None

    def get_paginated_response(self, data):
        from rest_framework.response import Response
        return Response({
            'results': data
        })

    def to_representation(self, instance):
        return instance