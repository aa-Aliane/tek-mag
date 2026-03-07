from rest_framework.pagination import PageNumberPagination


class OptionalPagination(PageNumberPagination):
    """
    Standard pagination that only triggers if 'paginate' is in the query params.
    """

    page_size = 25  # Default size when paginating
    page_size_query_param = "page_size"  # Allows ?page_size=50
    max_page_size = 100

    def paginate_queryset(self, queryset, request, view=None):
        # If '?paginate=true' is NOT in the URL, skip pagination
        if "page" not in request.query_params:
            return None
        return super().paginate_queryset(queryset, request, view)
