from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProductViewSet,
    BrandViewSet,
    ProductModelViewSet,
    LocationViewSet,
    SupplierViewSet,
    StockItemViewSet,
    StoreOrderViewSet,
    DeviceTypeViewSet,
)

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'brands', BrandViewSet)
router.register(r'product-models', ProductModelViewSet)
router.register(r'locations', LocationViewSet)
router.register(r'suppliers', SupplierViewSet)
router.register(r'stock-items', StockItemViewSet)
router.register(r'store-orders', StoreOrderViewSet)
router.register(r'device-types', DeviceTypeViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
