from django.shortcuts import render
from django.http import JsonResponse
import requests

def home(request):
   return render(request, 'index.html')

def send_json(request):
   payload = {'results': 500}

   field_1 = requests.get('https://api.thingspeak.com/channels/196384/fields/1.json', params=payload)

   return JsonResponse(field_1.json(), safe=False)
