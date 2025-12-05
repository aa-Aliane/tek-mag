from django.contrib import admin

from .models import Issue, Repair

admin.site.register(Repair)
admin.site.register(Issue)
