from django.contrib import admin
from .models import (
    Location,
    Supplier,
    StockItem,
    StoreOrder,
)

admin.site.register(Location)
admin.site.register(Supplier)
admin.site.register(StockItem)
admin.site.register(StoreOrder)
