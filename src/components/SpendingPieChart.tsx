import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface SpendingPieChartProps {
  income: number;
  spending: number;
  title?: string;
}

const SpendingPieChart: React.FC<SpendingPieChartProps> = ({ income, spending, title = 'Income vs Spending' }) => {
  const data: ChartData<'pie'> = {
    labels: ['Income', 'Spending'],
    datasets: [
      {
        data: [income, spending],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',  // Teal for income
          'rgba(255, 99, 132, 0.6)',   // Pink for spending
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw as number;
            const total = income + spending;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: $${value.toFixed(2)} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="spending-pie-chart">
      <Pie data={data} options={options} />
    </div>
  );
};

export default SpendingPieChart; 