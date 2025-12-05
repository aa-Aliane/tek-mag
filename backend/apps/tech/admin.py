from django.contrib import admin

from .models import (
    Brand,
    DeviceType,
    Product,
    ProductModel,
    Series,
    Location,
    Supplier,
    StockItem,
    StoreOrder,
)

admin.site.register(Brand)
admin.site.register(Product)
admin.site.register(ProductModel)
admin.site.register(Series)
admin.site.register(DeviceType)
admin.site.register(Location)
admin.site.register(Supplier)
admin.site.register(StockItem)
admin.site.register(StoreOrder)
