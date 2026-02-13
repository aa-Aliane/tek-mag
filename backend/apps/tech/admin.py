from django.contrib import admin

from .models import (
    Brand,
    DeviceType,
    Part,
    ProductModel,
    Series,
)

admin.site.register(Brand)
admin.site.register(Part)
admin.site.register(ProductModel)
admin.site.register(Series)
admin.site.register(DeviceType)
