from django.shortcuts import render
from django.http import JsonResponse
import requests
import pandas as pd
import ast
from iot_dashboard.prophet import get_prophet_instance

CHANNEL_ID = 196384
MAX_RESULTS = 500


def home(request):
    return render(request, "index.html")


def parse_feed(feed, id):
    date_time = feed["created_at"].split("T")

    feed_date = date_time[0]
    raw_feed_time = date_time[1]
    feed_time = raw_feed_time[: len(raw_feed_time) - 1]

    return {"ds": f"{feed_date} {feed_time}", "y": float(feed[f"field{id}"])}


def predict_field(request, id):
    if id != "1" and id != "2":
        return JsonResponse("Invalid ID parameter", safe=False, status=400)

    payload = {"results": MAX_RESULTS}

    field_1 = requests.get(
        f"https://api.thingspeak.com/channels/{CHANNEL_ID}/fields/{id}.json",
        params=payload,
    )

    field_feeds = field_1.json()["feeds"]

    parsed_field_feeds = list(
        map(
            lambda feed: parse_feed(feed, id),
            field_feeds,
        )
    )

    lower_bound = min(list(map(lambda feed: feed["y"], parsed_field_feeds)))
    upper_bound = max(list(map(lambda feed: feed["y"], parsed_field_feeds)))

    df = pd.DataFrame.from_dict(parsed_field_feeds)

    df["cap"] = upper_bound
    df["floor"] = lower_bound

    m = get_prophet_instance()
    m.fit(df)

    future = m.make_future_dataframe(periods=6, freq="H")

    future["cap"] = upper_bound
    future["floor"] = lower_bound

    forecast = m.predict(future)

    forecast = forecast.drop(forecast.index[:MAX_RESULTS])

    forecast_dict = ast.literal_eval(forecast[["ds", "yhat"]].to_json())

    forecast_response = []

    for position in forecast_dict["ds"].keys():
        forecast_response.append(
            {
                "timestamp": forecast_dict["ds"][position],
                "temperature": forecast_dict["yhat"][position],
            }
        )

    return JsonResponse(forecast_response, safe=False)
