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
        label: 'Proficiency',
        data: [
          data['Technical Skills'] || 0,
          data['Soft Skills'] || 0,
          data['Experience'] || 0,
          data['Education'] || 0,
          data['Domain Knowledge'] || 0,
        ],
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(139, 92, 246, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(139, 92, 246, 1)',
      },
    ],
  };

  const options = {
    scales: {
      r: {
        angleLines: { display: true, color: 'rgba(255, 255, 255, 0.05)' },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: { display: false, stepSize: 20 },
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        pointLabels: {
          font: { size: 10, weight: '700', family: 'Inter' },
          color: 'rgba(255, 255, 255, 0.5)'
        }
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 12, weight: 'bold' },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 12,
        displayColors: false
      }
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="h-full w-full flex items-center justify-center">
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
        backgroundColor: ['#10b981', 'rgba(239, 68, 68, 0.2)'],
        borderColor: ['#10b981', '#ef4444'],
        borderWidth: 0,
        hoverOffset: 10,
      },
    ],
  };

  const options = {
    cutout: '80%',
    plugins: {
      legend: { 
        position: 'bottom', 
        labels: { 
          boxWidth: 8, 
          usePointStyle: true,
          padding: 20, 
          color: 'rgba(255, 255, 255, 0.5)',
          font: { size: 10, weight: 'bold', family: 'Inter' } 
        } 
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 12
      }
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="h-full w-full">
      <Doughnut data={chartData} options={options} />
    </div>
  );
}

export function ScoreDistribution({ buckets }) {
  const chartData = {
    labels: ['0-20', '21-40', '41-60', '61-80', '81-100'],
    datasets: [
      {
        label: 'Scans',
        data: buckets,
        backgroundColor: 'rgba(139, 92, 246, 0.5)',
        hoverBackgroundColor: 'rgba(139, 92, 246, 0.8)',
        borderRadius: 6,
        borderWidth: 0,
      },
    ],
  };

  const options = {
    scales: {
      y: { 
        beginAtZero: true, 
        ticks: { stepSize: 1, color: 'rgba(255, 255, 255, 0.3)', font: { size: 10 } },
        grid: { color: 'rgba(255, 255, 255, 0.05)' }
      },
      x: { 
        grid: { display: false },
        ticks: { color: 'rgba(255, 255, 255, 0.3)', font: { size: 10 } }
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 12
      }
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="h-full w-full">
      <Bar data={chartData} options={options} />
    </div>
  );
}
