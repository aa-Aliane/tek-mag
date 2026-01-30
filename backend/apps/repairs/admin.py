from django.contrib import admin
from .models import Issue, Repair, PartQualityTier, ServicePricing, RepairIssue

admin.site.register(Repair)
admin.site.register(Issue)
admin.site.register(PartQualityTier)
admin.site.register(ServicePricing)
admin.site.register(RepairIssue)