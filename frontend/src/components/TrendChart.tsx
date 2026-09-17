import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Session } from "../types";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export function TrendChart({ sessions }: { sessions: Session[] }) {
  const scored = sessions
    .filter((s) => s.communicationScore && s.codeScore)
    .slice()
    .reverse();

  const data = {
    labels: scored.map((s, i) => `#${i + 1} ${s.problem.title}`),
    datasets: [
      {
        label: "Communication score",
        data: scored.map((s) => s.communicationScore!.overall),
        borderColor: "#9333ea",
        backgroundColor: "#9333ea",
        tension: 0.3,
      },
      {
        label: "Code score",
        data: scored.map((s) => s.codeScore!.overall),
        borderColor: "#2563eb",
        backgroundColor: "#2563eb",
        tension: 0.3,
      },
    ],
  };

  return (
    <Line
      data={data}
      options={{
        responsive: true,
        scales: { y: { min: 0, max: 10, ticks: { stepSize: 2 } } },
        plugins: { legend: { position: "bottom" } },
      }}
    />
  );
}
