from django.shortcuts import render
from django.http import HttpResponse, JsonResponse

def home(request):
   return render(request, 'index.html')

def send_json(request):
   data = [{'name': 'Peter', 'email': 'peter@example.org'},
         {'name': 'Julia', 'email': 'julia@example.org'}]

   return JsonResponse(data, safe=False)
