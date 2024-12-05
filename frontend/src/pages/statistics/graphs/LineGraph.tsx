import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function LineGraph({
  trades,
  initialPortfolioValue,
}: {
  trades: any[];
  initialPortfolioValue: number;
}) {
  if (!trades || trades.length === 0) {
    return <p>No trade data available</p>;
  }

  const cumulativeValues = trades.reduce(
    (acc, trade) => {
      const lastValue = acc[acc.length - 1];
      acc.push(lastValue + trade.return);
      return acc;
    },
    [initialPortfolioValue] 
  );

  const data = {
    labels: cumulativeValues.map((_ : unknown, index : unknown) => index), 
    datasets: [
      {
        label: "Portfolio Progress",
        data: cumulativeValues,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderWidth: 2,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Portfolio Performance Over Trades",
      },
    },
    scales: {
      x: { title: { display: true, text: "Trade Number" } },
      y: { title: { display: true, text: "Portfolio Value" } },
    },
  };

  return <Line data={data} options={options} />;
}

export default LineGraph;
