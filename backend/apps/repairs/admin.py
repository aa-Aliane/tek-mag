from django.contrib import admin

from .models import Issue, Repair, ProductQualityTier, ServicePricing, RepairIssue

admin.site.register(Repair)
admin.site.register(Issue)
admin.site.register(ProductQualityTier)
admin.site.register(ServicePricing)
admin.site.register(RepairIssue)
