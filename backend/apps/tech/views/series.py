from rest_framework import viewsets

from ..models import Series
from ..serializers import SeriesSerializer


class SeriesViewSet(viewsets.ModelViewSet):
    queryset = Series.objects.all()
    serializer_class = SeriesSerializer
