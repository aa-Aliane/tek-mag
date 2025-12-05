from .brand import BrandViewSet

from .product import ProductViewSet
from .product_model import ProductModelViewSet
from .location_viewset import LocationViewSet
from .supplier_viewset import SupplierViewSet
from .stock_item_viewset import StockItemViewSet
from .store_order_viewset import StoreOrderViewSet
from .device_type import DeviceTypeViewSet

__all__ = [
    "BrandViewSet",
    "ProductViewSet",
    "ProductModelViewSet",
    "LocationViewSet",
    "SupplierViewSet",
    "StockItemViewSet",
    "StoreOrderViewSet",
    "DeviceTypeViewSet",
]
from .series import SeriesViewSet
