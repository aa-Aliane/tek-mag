from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RepairViewSet, 
    IssueViewSet, 
    RepairIssueViewSet, 
    PartQualityTierViewSet, 
    ServicePricingViewSet
)

router = DefaultRouter()
router.register(r'repairs', RepairViewSet)
router.register(r'issues', IssueViewSet)
router.register(r'repair-issues', RepairIssueViewSet)
router.register(r'part-quality-tiers', PartQualityTierViewSet)
router.register(r'service-pricing', ServicePricingViewSet)

urlpatterns = [
    path('', include(router.urls)),
]