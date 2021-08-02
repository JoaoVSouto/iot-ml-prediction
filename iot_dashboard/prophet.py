from prophet import Prophet


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
