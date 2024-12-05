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

function AccumulatedReturnsChart({ trades }: { trades: { currencyPair: string, return: number }[] }) {
  if (!trades || trades.length === 0) {
    return <p>No trade data available</p>;
  }

  const accumulatedReturns: Record<string, number> = trades.reduce((acc, trade) => {
    acc[trade.currencyPair] = (acc[trade.return] || 0) + trade.return;
    return acc;
  }, {} as Record<string, number>);

  const pairs = Object.keys(accumulatedReturns);
  const returns = Object.values(accumulatedReturns);

  const data = {
    labels: pairs, 
    datasets: [
      {
        label: "Accumulated Returns",
        data: returns, 
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
        text: "Accumulated Returns by Pair",
      },
    },
    scales: {
      x: { title: { display: true, text: "Trading Pairs" } },
      y: { title: { display: true, text: "Accumulated Returns" } },
    },
  };

  return (
    <div className="accumulated-returns-chart">
      <Bar data={data} options={options} />
    </div>
  );
}

export default AccumulatedReturnsChart;
