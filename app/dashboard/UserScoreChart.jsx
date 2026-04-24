'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function UserScoreChart({ scores }) {
  // Sort scores by date
  const sortedScores = [...scores].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  const data = {
    labels: sortedScores.map(s => new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Match Score (%)',
        data: sortedScores.map(s => s.score),
        fill: true,
        borderColor: 'rgba(139, 92, 246, 1)',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, 'rgba(139, 92, 246, 0.2)');
          gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
          return gradient;
        },
        tension: 0.4,
        pointBackgroundColor: 'rgba(139, 92, 246, 1)',
        pointBorderColor: '#fff',
        pointHoverRadius: 8,
        pointRadius: 4,
        borderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 12,
        titleFont: { size: 12, weight: 'bold', family: 'Inter' },
        bodyFont: { size: 12, family: 'Inter' },
        displayColors: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          stepSize: 20,
          callback: (value) => `${value}%`,
          color: 'rgba(255, 255, 255, 0.3)',
          font: { size: 10, weight: 'bold' },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.3)',
          font: { size: 10, weight: 'bold' },
        },
      },
    },
  };

  return (
    <div className="h-full w-full">
      <Line data={data} options={options} />
    </div>
  );
}
