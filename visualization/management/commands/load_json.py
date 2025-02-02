import json
from django.core.management.base import BaseCommand
from visualization.models import cofferData

def clean_data(entry):
    """Ensure empty strings are replaced with None or default values."""
    if entry.get("intensity") == '':
        entry["intensity"] = 0  # Set default value for intensity
    if entry.get("likelihood") == '':
        entry["likelihood"] = 0  # Set default value for likelihood
    if entry.get("end_year") == '':
        entry["end_year"] = None  # Set None if empty string for end_year
    if entry.get("start_year") == '':
        entry["start_year"] = None  # Set None if empty string for start_year
    if entry.get("relevance") == '':
        entry["relevance"] = 0  # Set default value for relevance (0 or None)
    if entry.get("impact") == '':
        entry["impact"] = None  # Set None for impact if empty
    if entry.get("country") == '':
        entry["country"] = None  # Set None for country if empty
    if entry.get("pestle") == '':
        entry["pestle"] = None  # Set None for pestle if empty
    if entry.get("title") == '':
        entry["title"] = None  # Set None for title if empty
    if entry.get("url") == '':
        entry["url"] = None  # Set None for URL if empty
    # Repeat for other fields as necessary
    return entry


class Command(BaseCommand):
    help = 'Load data from JSON file into the database'

    def handle(self, *args, **kwargs):
        with open('visualization/jsondata.json', 'r', encoding='utf-8') as file:
            data = json.load(file)

        for entry in data:
            cleaned_entry = clean_data(entry)
            cofferData.objects.create(**cleaned_entry)

        self.stdout.write(self.style.SUCCESS('Successfully loaded data into the database'))

# class Command(BaseCommand):
#     help = 'Load a JSON file into the database'
#     def handle(self,*args, **kwargs):
#         file_path = 'visualization/jsondata.json'
#         try:
#             with open(file_path, 'r', encoding='utf-8') as file:
#                 data = json.load(file)

#                 for entry in data:
#                     cofferData.objects.create(
#                         end_year=entry.get("end_year", ""),
#                         intensity=entry.get("intensity",0),
#                         sector=entry.get("sector", ""),
#                         topic=entry.get("topic", ""),
#                         insight=entry.get("insight", ""),
#                         url=entry.get("url", ""),
#                         region=entry.get("region", ""),
#                         start_year=entry.get("start_year", ""),
#                         impact=entry.get("impact", ""),
#                         added=entry.get("added", ""),
#                         published=entry.get("published", ""),
#                         country=entry.get("country", ""),
#                         relevance=entry.get("relevance", 0),
#                         pestle=entry.get("pestle", ""),
#                         source=entry.get("source", ""),
#                         title=entry.get("title", ""),
#                         likelihood=entry.get("likelihood", 0),
#                     )
#                 self.stdout.write(self.style.SUCCESS("Data loaded successfully!"))
    
#         except Exception as e:
#             self.stderr.write(self.style.ERROR(f"Error: {e}"))