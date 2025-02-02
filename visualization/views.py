from django.shortcuts import render
from rest_framework import viewsets
from .models import cofferData
from .serializers import cofferDataSerializer

# Create your views here.

class cofferDataViewSet(viewsets.ModelViewSet):
    queryset = cofferData.objects.all()
    serializer_class = cofferDataSerializer

def index(request):
    return render(request, 'app/index.html')  
     
     