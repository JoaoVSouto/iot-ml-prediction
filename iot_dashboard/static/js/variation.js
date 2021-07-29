(() => {
  const ctx = document.getElementById('variation-field-1').getContext('2d');
  window.variationField1 = new Chart(
    ctx,
    createChartConfig({
      datasetLabel: 'Variação da Temperatura Externa',
      xAxisLabel: 'Tempo',
      yAxisLabel: 'Temperatura [ºC]',
    })
  );
})();

(() => {
  const ctx = document.getElementById('variation-field-2').getContext('2d');
  window.variationField2 = new Chart(
    ctx,
    createChartConfig({
      datasetLabel: 'Variação da Temperatura',
      xAxisLabel: 'Tempo',
      yAxisLabel: 'Temperatura [ºC]',
    })
  );
})();

(() => {
  const ctx = document.getElementById('variation-field-3').getContext('2d');
  window.variationField3 = new Chart(
    ctx,
    createChartConfig({
      datasetLabel: 'Variação da Pressão do Ar (BPM280)',
      xAxisLabel: 'Tempo',
      yAxisLabel: 'Pressão [mmHg]',
    })
  );
})();

(() => {
  const ctx = document.getElementById('variation-field-4').getContext('2d');
  window.variationField4 = new Chart(
    ctx,
    createChartConfig({
      datasetLabel: 'Variação da Humidade',
      xAxisLabel: 'Tempo',
      yAxisLabel: 'Humidade [%]',
    })
  );
})();

async function calculateFieldVariation({ chartInstance, fieldNumber }) {
  const response = await fetch(
    `https://api.thingspeak.com/channels/${GLOBAL_UTILS.CHANNEL_ID}/fields/${fieldNumber}.json?results=500`
  );
  const data = await response.json();

  const fieldsValues = data.feeds.map((feed) =>
    Number(feed[`field${fieldNumber}`])
  );

  const maxFieldValue = Math.max(...fieldsValues);
  const minFieldValue = Math.min(...fieldsValues);
  const fieldVariation = Math.abs(maxFieldValue - minFieldValue);

  chartInstance.data.datasets[0].data.push(fieldVariation.toFixed(2));

  const currentDate = new Date();
  const hours = currentDate.getHours().toString().padStart(2, '0');
  const minutes = currentDate.getMinutes().toString().padStart(2, '0');
  chartInstance.data.labels.push(`${hours}:${minutes}`);

  chartInstance.update();
}

function getChartsFieldsVariation() {
  calculateFieldVariation({
    chartInstance: window.variationField1,
    fieldNumber: 1,
  });

  calculateFieldVariation({
    chartInstance: window.variationField2,
    fieldNumber: 2,
  });

  calculateFieldVariation({
    chartInstance: window.variationField3,
    fieldNumber: 3,
  });

  calculateFieldVariation({
    chartInstance: window.variationField4,
    fieldNumber: 4,
  });
}

getChartsFieldsVariation();

setInterval(() => {
  getChartsFieldsVariation();
}, GLOBAL_UTILS.FIVE_MINUTES_IN_MS);
