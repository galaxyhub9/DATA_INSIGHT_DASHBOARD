from rest_framework import serializers
from .models import cofferData


class cofferDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = cofferData
        fields = '__all__'
        