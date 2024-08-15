import { Line } from "react-chartjs-2";
import "chart.js/auto";

import "chartjs-adapter-date-fns";
import { enUS } from "date-fns/locale";

import { Chart } from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";

import "../../styles/UserStyles/components/HVChart.css";

Chart.register(annotationPlugin);

function HVChart(props: {
  response: {
    dates: string[];
    values: Number[];
    earnings_dates: string[];
    stock_history: Number[];
  };
}) {
  // Format the data for Chart.js
  const formattedData = {
    labels: props.response.dates,
    datasets: [
      {
        type: "line",
        label: "Historical Volatility (decimal)",
        data: props.response.values,
        borderColor: "blue",
        fill: false,
        tension: 0.1,
        yAxisID: "y1",
      },
      {
        type: "line",
        label: "Stock history",
        data: props.response.stock_history,
        borderColor: "green",
        fill: false,
        tension: 0.2,
        yAxisID: "y2",
      },
      {
        type: "line",
        label: "Earnings Dates",
        data: [],
        borderColor: "red",
        fill: false,
        yAxisID: "y3",
      },
    ],
  };

  const options = {
    data: formattedData,
    options: {
      responsive: true,
      interaction: {
        mode: "index",
        intersect: false,
      },
      stacked: false,
    },
    scales: {
      x: {
        type: "time",
        time: {
          unit: "day",
        },
        title: {
          display: true,
          text: "Date",
        },
        adapters: {
          date: {
            locale: enUS,
          },
        },
      },
      y1: {
        title: {
          display: true,
          text: "Historical Volatility",
        },
        display: true,
        position: "left",
      },
      y2: {
        title: {
          display: true,
          text: "Stock Price",
        },
        display: true,
        position: "right",
        grid: {
          drawOnChartArea: false, // only want the grid lines for one axis to show up
        },
      },
      y3: {
        display: false,
      },
    },
    plugins: {
      annotation: {
        annotations: props.response.earnings_dates.map((date: string) => {
          return {
            type: "line",
            xMin: date,
            xMax: date,
            borderColor: "rgb(255, 99, 132)",
            borderWidth: 2,
            borderDash: [15, 10],
          };
        }),
      },
    },
  };

  return (
    <div className="HVChart">
      {formattedData ? (
        <Line data={formattedData} options={options} />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default HVChart;
