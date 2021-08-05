from prophet import Prophet
import requests
import pandas as pd
import ast

CHANNEL_ID = 196384
MAX_RESULTS = 500


def get_prophet_instance():
    m = (
        Prophet(
            growth="logistic",
            seasonality_mode="multiplicative",
            changepoint_prior_scale=0.01,
            daily_seasonality=True,
        )
        .add_seasonality(name="daily", period=1, fourier_order=3, prior_scale=0.2)
        .add_seasonality(name="weekly", period=7, fourier_order=3, prior_scale=0.2)
        .add_seasonality(name="monthly", period=30.50, fourier_order=3, prior_scale=0.2)
        .add_seasonality(
            name="quaterly", period=365.25 / 4, fourier_order=3, prior_scale=0.1
        )
        .add_seasonality(name="yearly", period=365.25, fourier_order=4, prior_scale=0.2)
    )

    return m


def parse_feed(feed, id):
    date_time = feed["created_at"].split("T")

    feed_date = date_time[0]
    raw_feed_time = date_time[1]
    feed_time = raw_feed_time[: len(raw_feed_time) - 1]

    return {"ds": f"{feed_date} {feed_time}", "y": float(feed[f"field{id}"])}


def predict_forecast(id):
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

    future = m.make_future_dataframe(periods=18, freq="H")

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

    return forecast_response
