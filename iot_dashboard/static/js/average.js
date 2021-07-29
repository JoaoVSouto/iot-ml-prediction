(() => {
  const ctx = document.getElementById('average-field-1').getContext('2d');
  window.averageField1 = new Chart(
    ctx,
    createChartConfig({
      datasetLabel: 'Média da Temperatura Externa',
      xAxisLabel: 'Tempo',
      yAxisLabel: 'Temperatura [ºC]',
    })
  );
})();

(() => {
  const ctx = document.getElementById('average-field-2').getContext('2d');
  window.averageField2 = new Chart(
    ctx,
    createChartConfig({
      datasetLabel: 'Média da Temperatura',
      xAxisLabel: 'Tempo',
      yAxisLabel: 'Temperatura [ºC]',
    })
  );
})();

(() => {
  const ctx = document.getElementById('average-field-3').getContext('2d');
  window.averageField3 = new Chart(
    ctx,
    createChartConfig({
      datasetLabel: 'Média da Pressão do Ar (BPM280)',
      xAxisLabel: 'Tempo',
      yAxisLabel: 'Pressão [mmHg]',
    })
  );
})();

(() => {
  const ctx = document.getElementById('average-field-4').getContext('2d');
  window.averageField4 = new Chart(
    ctx,
    createChartConfig({
      datasetLabel: 'Média da Humidade',
      xAxisLabel: 'Tempo',
      yAxisLabel: 'Humidade [%]',
    })
  );
})();

async function calculateFieldAverage({ chartInstance, fieldNumber }) {
  const response = await fetch(
    `https://api.thingspeak.com/channels/${GLOBAL_UTILS.CHANNEL_ID}/fields/${fieldNumber}.json?results=500`
  );
  const data = await response.json();

  const fieldSummation = data.feeds.reduce(
    (sum, feed) => sum + Number(feed[`field${fieldNumber}`]),
    0
  );
  const fieldAverage = fieldSummation / data.feeds.length;

  chartInstance.data.datasets[0].data.push(fieldAverage.toFixed(2));

  const currentDate = new Date();
  const hours = currentDate.getHours().toString().padStart(2, '0');
  const minutes = currentDate.getMinutes().toString().padStart(2, '0');
  chartInstance.data.labels.push(`${hours}:${minutes}`);

  chartInstance.update();
}

function getChartsFieldsAverage() {
  calculateFieldAverage({
    chartInstance: window.averageField1,
    fieldNumber: 1,
  });

  calculateFieldAverage({
    chartInstance: window.averageField2,
    fieldNumber: 2,
  });

  calculateFieldAverage({
    chartInstance: window.averageField3,
    fieldNumber: 3,
  });

  calculateFieldAverage({
    chartInstance: window.averageField4,
    fieldNumber: 4,
  });
}

getChartsFieldsAverage();

setInterval(() => {
  getChartsFieldsAverage();
}, GLOBAL_UTILS.FIVE_MINUTES_IN_MS);
