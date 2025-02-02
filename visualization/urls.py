from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import cofferDataViewSet,index

router = DefaultRouter()
router.register(r'cofferData', cofferDataViewSet)

urlpatterns = [
    path('',index, name='index'),
    path('api/', include(router.urls)),
]