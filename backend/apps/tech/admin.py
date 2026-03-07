from django.contrib import admin

from .models import (
    Brand,
    Color,
    DeviceType,
    Part,
    ProductModel,
    ProductVariant,
    QualityTier,
    Series,
)

admin.site.register(Brand)
admin.site.register(Part)
admin.site.register(ProductModel)
admin.site.register(Series)
admin.site.register(DeviceType)
admin.site.register(Color)
admin.site.register(QualityTier)
admin.site.register(ProductVariant)
