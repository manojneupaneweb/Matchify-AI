'use client';

import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import { Radar, Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Filler,
  Tooltip,
  Legend
);

export function SkillsRadar({ data }) {
  const chartData = {
    labels: ['Technical', 'Soft Skills', 'Experience', 'Education', 'Domain'],
    datasets: [
      {
        label: 'Average Proficiency',
        data: [
          data['Technical Skills'] || 0,
          data['Soft Skills'] || 0,
          data['Experience'] || 0,
          data['Education'] || 0,
          data['Domain Knowledge'] || 0,
        ],
        backgroundColor: 'rgba(79, 70, 229, 0.2)',
        borderColor: 'rgb(79, 70, 229)',
        borderWidth: 2,
        pointBackgroundColor: 'rgb(79, 70, 229)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(79, 70, 229)',
      },
    ],
  };

  const options = {
    scales: {
      r: {
        angleLines: { display: true, color: 'rgba(156, 163, 175, 0.1)' },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: { display: false, stepSize: 20 },
        grid: { color: 'rgba(156, 163, 175, 0.1)' },
        pointLabels: {
          font: { size: 11, weight: '600' },
          color: 'rgba(156, 163, 175, 0.8)'
        }
      },
    },
    plugins: {
      legend: { display: false },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="h-64 w-full flex items-center justify-center">
      <Radar data={chartData} options={options} />
    </div>
  );
}

export function KeywordCoverage({ matched, missing }) {
  const chartData = {
    labels: ['Matched', 'Missing'],
    datasets: [
      {
        data: [matched, missing],
        backgroundColor: ['#10b981', '#ef4444'],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    cutout: '70%',
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 12, padding: 15, font: { size: 12 } } },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="h-64 w-full">
      <Doughnut data={chartData} options={options} />
    </div>
  );
}

export function ScoreDistribution({ buckets }) {
  const chartData = {
    labels: ['0-20', '21-40', '41-60', '61-80', '81-100'],
    datasets: [
      {
        label: 'Number of Scans',
        data: buckets,
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderRadius: 8,
      },
    ],
  };

  const options = {
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } },
      x: { grid: { display: false } },
    },
    plugins: {
      legend: { display: false },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="h-64 w-full">
      <Bar data={chartData} options={options} />
    </div>
  );
}
