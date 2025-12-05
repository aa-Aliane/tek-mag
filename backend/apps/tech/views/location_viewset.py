from rest_framework import viewsets
from apps.tech.models import Location
from apps.tech.serializers import LocationSerializer


class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
