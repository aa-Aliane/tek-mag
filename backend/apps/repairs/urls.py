from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RepairViewSet, IssueViewSet

router = DefaultRouter()
router.register(r'repairs', RepairViewSet)
router.register(r'issues', IssueViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
