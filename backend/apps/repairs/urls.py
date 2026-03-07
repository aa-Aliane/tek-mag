from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import IssueViewSet, LaborPriceViewSet, RepairLineItemViewSet, RepairViewSet

router = DefaultRouter()
router.register(r"issues", IssueViewSet)
router.register(r"labor-prices", LaborPriceViewSet)
router.register(r"repairs", RepairViewSet)
router.register(r"line-items", RepairLineItemViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
