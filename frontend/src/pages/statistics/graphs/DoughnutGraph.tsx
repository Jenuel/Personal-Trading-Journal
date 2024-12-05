import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

function DoughnotChart({ trades }: { trades: { status: string }[] }) {
  if (!trades || trades.length === 0) {
    return <p>No trade data available</p>;
  }

  const wins = trades.filter((trade) => trade.status.toLowerCase() === "win").length;
  const losses = trades.filter((trade) => trade.status.toLowerCase() === "loss").length;
  const total = wins + losses;


  const winRate = total > 0 ? ((wins / total) * 100).toFixed(2) : "0";

  const data = {
    labels: ["Wins", "Losses"],
    datasets: [
      {
        label: "Win Rate",
        data: [wins, losses],
        backgroundColor: ["rgba(15, 92, 28)", "rgba(255, 17, 0)"],
        borderColor: ["rgba(75, 192, 192, 1)", "rgba(255, 99, 132, 1)"],
        borderWidth: 1,
      },
    ],
  };

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            const value = tooltipItem.raw as number;
            const percentage = ((value / total) * 100).toFixed(2);
            return `${tooltipItem.label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="win-rate-chart">
      <h3>Win Rate: {winRate}%</h3>
      <Doughnut data={data} options={options} />
    </div>
  );
}

export default DoughnotChart;
