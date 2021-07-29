const GLOBAL_UTILS = {
  CHANNEL_ID: 196384,
  FIVE_MINUTES_IN_MS: 1000 * 60 * 5,
};

function createChartConfig({ datasetLabel, xAxisLabel, yAxisLabel }) {
  return {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: datasetLabel,
          data: [],
          borderWidth: 6,
          borderColor: 'rgba(77,166,253,0.85)',
          backgroundColor: 'transparent',
        },
      ],
    },
    options: {
      responsive: true,
      title: {
        display: false,
      },
      tooltips: {
        mode: 'index',
        intersect: false,
      },
      hover: {
        mode: 'nearest',
        intersect: true,
      },
      scales: {
        xAxes: [
          {
            display: true,
            scaleLabel: {
              display: true,
              labelString: xAxisLabel,
            },
          },
        ],
        yAxes: [
          {
            display: true,
            scaleLabel: {
              display: true,
              labelString: yAxisLabel,
            },
          },
        ],
      },
    },
  };
}

(() => {
  const ctx = document.getElementById('raw-field-1').getContext('2d');
  window.rawField1 = new Chart(
    ctx,
    createChartConfig({
      datasetLabel: 'Temperatura Externa',
      xAxisLabel: 'Tempo',
      yAxisLabel: 'Temperatura [ºC]',
    })
  );
})();

(() => {
  const ctx = document.getElementById('raw-field-2').getContext('2d');
  window.rawField2 = new Chart(
    ctx,
    createChartConfig({
      datasetLabel: 'Temperatura',
      xAxisLabel: 'Tempo',
      yAxisLabel: 'Temperatura [ºC]',
    })
  );
})();

(() => {
  const ctx = document.getElementById('raw-field-3').getContext('2d');
  window.rawField3 = new Chart(
    ctx,
    createChartConfig({
      datasetLabel: 'Pressão do Ar (BPM280)',
      xAxisLabel: 'Tempo',
      yAxisLabel: 'Pressão [mmHg]',
    })
  );
})();

(() => {
  const ctx = document.getElementById('raw-field-4').getContext('2d');
  window.rawField4 = new Chart(
    ctx,
    createChartConfig({
      datasetLabel: 'Humidade',
      xAxisLabel: 'Tempo',
      yAxisLabel: 'Humidade [%]',
    })
  );
})();

async function getLastThingSpeakData({ chartInstance, fieldNumber }) {
  const response = await fetch(
    `https://api.thingspeak.com/channels/${GLOBAL_UTILS.CHANNEL_ID}/fields/${fieldNumber}.json?results=500`
  );
  const data = await response.json();

  chartInstance.data.datasets[0].data = [];
  chartInstance.data.labels = [];

  data.feeds.forEach((feed) => {
    chartInstance.data.datasets[0].data.push(feed[`field${fieldNumber}`]);

    const time = new Date(feed.created_at);
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    chartInstance.data.labels.push(`${hours}:${minutes}`);
  });

  chartInstance.update();
}

function getRawChartsData() {
  getLastThingSpeakData({
    chartInstance: window.rawField1,
    fieldNumber: 1,
  });

  getLastThingSpeakData({
    chartInstance: window.rawField2,
    fieldNumber: 2,
  });

  getLastThingSpeakData({
    chartInstance: window.rawField3,
    fieldNumber: 3,
  });

  getLastThingSpeakData({
    chartInstance: window.rawField4,
    fieldNumber: 4,
  });
}

getRawChartsData();

setInterval(() => {
  getRawChartsData();
}, GLOBAL_UTILS.FIVE_MINUTES_IN_MS);
