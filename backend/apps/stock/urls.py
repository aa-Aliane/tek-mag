from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LocationViewSet,
    SupplierViewSet,
    StockItemViewSet,
    StoreOrderViewSet,
)

router = DefaultRouter()
router.register(r'locations', LocationViewSet)
router.register(r'suppliers', SupplierViewSet)
router.register(r'stock-items', StockItemViewSet)
router.register(r'store-orders', StoreOrderViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
