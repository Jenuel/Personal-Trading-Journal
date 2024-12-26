import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function BarChart({ trades }: { trades: { currencyPair: string }[] }) {
  if (!trades || trades.length === 0) {
    return <p>No trade data available</p>;
  }

  // Count trades for each pair
  const tradeCounts = trades.reduce((acc: Record<string, number>, trade) => {
    acc[trade.currencyPair] = (acc[trade.currencyPair] || 0) + 1;
    return acc;
  }, {});

  const pairs = Object.keys(tradeCounts);
  const counts = Object.values(tradeCounts);

  const data = {
    labels: pairs, 
    datasets: [
      {
        label: "Number of Trades",
        data: counts,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Number of Trades by Pair",
      },
    },
    scales: {
      x: { title: { display: true, text: "Trading Pairs" } },
      y: { title: { display: true, text: "Trade Count" } },
    },
  };

  return (
    <Bar data={data} options={options} />
  );
}

export default BarChart;
