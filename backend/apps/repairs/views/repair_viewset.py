from rest_framework import viewsets
from apps.repairs.models import Repair
from apps.repairs.serializers import RepairSerializer


class RepairViewSet(viewsets.ModelViewSet):
    queryset = Repair.objects.all()
    serializer_class = RepairSerializer
