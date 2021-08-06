from django.shortcuts import render
from django.http import JsonResponse
from iot_dashboard.prophet import predict_forecast
from rq import Queue
from worker import conn

q = Queue(connection=conn)

result_1 = {"value": None}
result_2 = {"value": None}


def home(request):
    return render(request, "index.html")


def predict_field_1(request):
    if not result_1["value"]:
        result_1["value"] = q.enqueue(predict_forecast, 1)

    if not result_1["value"].result:
        return JsonResponse("Still predicting values...", safe=False, status=418)

    predict_values = result_1["value"].result

    result_1["value"] = None

    return JsonResponse(predict_values, safe=False)


def predict_field_2(request):
    if not result_2["value"]:
        result_2["value"] = q.enqueue(predict_forecast, 2)

    if not result_2["value"].result:
        return JsonResponse("Still predicting values...", safe=False, status=418)

    predict_values = result_2["value"].result

    result_2["value"] = None

    return JsonResponse(predict_values, safe=False)
