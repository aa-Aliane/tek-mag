from django.contrib import admin

from .models import Discount, Payment, Refund

admin.site.register(Discount)
admin.site.register(Payment)
admin.site.register(Refund)
