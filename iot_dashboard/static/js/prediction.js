(() => {
  const ctx = document.getElementById('predict-field-1').getContext('2d');
  window.predictField1 = new Chart(
    ctx,
    createChartConfig({
      datasetLabel: 'Previsão da Temperatura Externa',
      xAxisLabel: 'Tempo',
      yAxisLabel: 'Temperatura [ºC]',
    })
  );
})();

(() => {
  const ctx = document.getElementById('predict-field-2').getContext('2d');
  window.predictField2 = new Chart(
    ctx,
    createChartConfig({
      datasetLabel: 'Previsão da Temperatura',
      xAxisLabel: 'Tempo',
      yAxisLabel: 'Temperatura [ºC]',
    })
  );
})();

const delay = (time = 1000) =>
  new Promise(resolve => setTimeout(resolve, time));

async function calculateFieldPrediction({ chartInstance, fieldNumber }) {
  const chartCanva = document.getElementById(
    `predict-chart-container-${fieldNumber}`
  );
  const chartLoading = document.getElementById(`loading${fieldNumber}`);

  chartCanva.style.display = 'none';
  chartLoading.style.display = 'block';

  try {
    const response = await fetch(`/predict/${fieldNumber}/`);
    const data = await response.json();

    if (response.status === 418) {
      throw new Error('Invalid request');
    }

    chartCanva.style.display = 'block';
    chartLoading.style.display = 'none';

    chartInstance.data.datasets[0].data = [];
    chartInstance.data.labels = [];

    data.forEach(feed => {
      chartInstance.data.datasets[0].data.push(feed.temperature.toFixed(2));

      const feedDate = new Date(feed.timestamp);
      const hours = feedDate.getHours().toString().padStart(2, '0');
      const minutes = feedDate.getMinutes().toString().padStart(2, '0');
      chartInstance.data.labels.push(`${hours}:${minutes}`);
    });

    chartInstance.update();
  } catch {
    await delay(5000);
    calculateFieldPrediction({ chartInstance, fieldNumber });
  }
}

function getChartsFieldsPrediction() {
  calculateFieldPrediction({
    chartInstance: window.predictField1,
    fieldNumber: 1,
  });

  calculateFieldPrediction({
    chartInstance: window.predictField2,
    fieldNumber: 2,
  });
}

getChartsFieldsPrediction();

setInterval(() => {
  getChartsFieldsPrediction();
}, GLOBAL_UTILS.FIVE_MINUTES_IN_MS);
