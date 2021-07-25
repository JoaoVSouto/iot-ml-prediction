const config = {
  type: 'line',
  data: {
    labels: [],
    datasets: [
      {
        label: 'Temperatura',
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
            labelString: 'Tempo',
          },
        },
      ],
      yAxes: [
        {
          display: true,
          scaleLabel: {
            display: true,
            labelString: 'Temperatura ºC',
          },
        },
      ],
    },
  },
};

(() => {
  const ctx = document.getElementById('canvas').getContext('2d');
  window.myLine = new Chart(ctx, config);
})();

async function getLastThingSpeakData() {
  const CHANNEL_ID = 1293177;

  const response = await fetch(
    `https://api.thingspeak.com/channels/${CHANNEL_ID}/fields/1.json`
  );
  const data = await response.json();

  window.myLine.data.datasets[0].data = [];
  window.myLine.data.labels = [];

  data.feeds.forEach(feed => {
    window.myLine.data.datasets[0].data.push(feed.field1);

    const time = new Date(feed.created_at);
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    window.myLine.data.labels.push(`${hours}:${minutes}`);
  });

  window.myLine.update();
}

getLastThingSpeakData();

setInterval(() => {
  getLastThingSpeakData();
}, 1000 * 60);
