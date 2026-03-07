from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    BrandViewSet,
    CatalogueViewSet,
    ColorViewSet,
    DeviceTypeViewSet,
    PartViewSet,
    ProductModelViewSet,
    ProductVariantViewSet,
    QualityTierViewSet,
    SeriesViewSet,
)

router = DefaultRouter()
router.register(r"parts", PartViewSet)
router.register(r"product-variants", ProductVariantViewSet)
router.register(r"brands", BrandViewSet)
router.register(r"product-models", ProductModelViewSet)
router.register(r"device-types", DeviceTypeViewSet)
router.register(r"series", SeriesViewSet)
router.register(r"colors", ColorViewSet)
router.register(r"quality-tiers", QualityTierViewSet)
router.register(r"catalogue", CatalogueViewSet, basename="catalogue")


urlpatterns = [
    path("", include(router.urls)),
]
