from django.shortcuts import render
from django.http import JsonResponse
from iot_dashboard.prophet import predict_forecast
from rq import Queue
from worker import conn
import threading

q = Queue(connection=conn)

result = {"value": None}


def set_interval(func, sec):
    def func_wrapper():
        set_interval(func, sec)
        func()

    t = threading.Timer(sec, func_wrapper)
    t.start()
    return t


def home(request):
    return render(request, "index.html")


def print_result():
    if result["value"]:
        print(result["value"].result)
    else:
        print("nothing")


def predict_field(request, id):
    if id != "1" and id != "2":
        return JsonResponse("Invalid ID parameter", safe=False, status=400)

    if not result["value"]:
        result["value"] = q.enqueue(predict_forecast, id)

    if not result["value"].result:
        return JsonResponse("Still predicting values...", safe=False, status=418)

    predict_values = result["value"].result

    result["value"] = None

    return JsonResponse(predict_values, safe=False)
