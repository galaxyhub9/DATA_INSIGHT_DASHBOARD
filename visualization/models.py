from django.db import models
from datetime import datetime

class cofferData(models.Model):
    end_year = models.CharField(max_length=255, null=True, blank=True)  # Allows empty strings or None
    intensity = models.IntegerField(null=True, blank=True, default=0)  # Default 0 for missing values
    sector = models.CharField(max_length=255, null=True, blank=True)
    topic = models.CharField(max_length=255, null=True, blank=True)
    insight = models.CharField(max_length=255, null=True, blank=True)
    url = models.CharField(max_length=500, null=True, blank=True)
    region = models.CharField(max_length=255, null=True, blank=True)
    start_year = models.CharField(max_length=255, null=True, blank=True)
    impact = models.CharField(max_length=255, null=True, blank=True)
    added = models.DateTimeField(null=True, blank=True)
    published = models.DateTimeField(null=True, blank=True)
    country = models.CharField(max_length=255, null=True, blank=True)
    relevance = models.IntegerField(null=True, blank=True, default=0)  # Default 0 for missing values
    pestle = models.CharField(max_length=255, null=True, blank=True)
    source = models.CharField(max_length=255, null=True, blank=True)
    title = models.CharField(max_length=1000, null=True, blank=True)
    likelihood = models.IntegerField(null=True, blank=True, default=0)  # Default 0 for missing values
    def save(self, *args, **kwargs):
            if isinstance(self.added, str):
                try:
                    self.added = datetime.strptime(self.added, "%B, %d %Y %H:%M:%S")
                except ValueError:
                    self.added = None  # Set to None if invalid

            if isinstance(self.published, str):
                try:
                    self.published = datetime.strptime(self.published, "%B, %d %Y %H:%M:%S")
                except ValueError:
                    self.published = None

            super().save(*args, **kwargs)
    
    def __str__(self):
        return self.title
    