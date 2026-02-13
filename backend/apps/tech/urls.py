from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PartViewSet,
    BrandViewSet,
    ProductModelViewSet,
    DeviceTypeViewSet,
    SeriesViewSet,
)

router = DefaultRouter()
router.register(r'parts', PartViewSet)
router.register(r'brands', BrandViewSet)
router.register(r'product-models', ProductModelViewSet)
router.register(r'device-types', DeviceTypeViewSet)
router.register(r'series', SeriesViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
