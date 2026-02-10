from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RepairViewSet, 
    IssueViewSet, 
    RepairIssueViewSet, 
    PartQualityTierViewSet, 
    ServicePricingViewSet,
    PaymentViewSet,
    DiscountViewSet
)

router = DefaultRouter()
router.register(r'repairs', RepairViewSet)
router.register(r'issues', IssueViewSet)
router.register(r'repair-issues', RepairIssueViewSet)
router.register(r'part-quality-tiers', PartQualityTierViewSet)
router.register(r'service-pricing', ServicePricingViewSet)
router.register(r'repairs/(?P<repair_pk>[^/.]+)/payments', PaymentViewSet, basename='repair-payment')
router.register(r'repairs/(?P<repair_pk>[^/.]+)/discounts', DiscountViewSet, basename='repair-discount')

urlpatterns = [
    path('', include(router.urls)),
]