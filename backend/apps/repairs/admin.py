from django.contrib import admin

from .models import Issue, LaborPrice, Repair, RepairLineItem

admin.site.register(Repair)
admin.site.register(Issue)
admin.site.register(LaborPrice)
admin.site.register(RepairLineItem)
