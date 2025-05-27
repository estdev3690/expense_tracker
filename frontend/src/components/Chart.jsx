import React from 'react';
import { Bar } from 'react-chartjs-2';
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const IncomeExpenseChart = () => {
  const { incomeData, expenseData } = useContext(AppContext);
  console.log('Chart Data:', { incomeData, expenseData });

  // Calculate total income
  const totalIncome = (incomeData || []).reduce(
    (sum, item) => sum + parseFloat(item.amount),
    0
  );

  // Calculate total expense
  const totalExpense = (expenseData || []).reduce(
    (sum, item) => sum + parseFloat(item.amount),
    0
  );

  console.log('Calculated totals:', { totalIncome, totalExpense });

  const data = {
    labels: ['Income', 'Expense'],
    datasets: [
      {
        label: 'Amount (₹)',
        data: [totalIncome, totalExpense],
        backgroundColor: ['#4ade80', '#f87171'],
        borderRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `₹ ${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₹ ' + value.toFixed(2);
          }
        }
      }
    },
  };

  return (
    <div className="w-full h-[300px] lg:h-[625px] bg-white p-4 rounded-lg shadow mt-4 lg:mt-8">
      <h2 className="text-xl font-bold mb-4 ">Income vs Expense</h2>
      <div className="h-[calc(100%-50px)]"> {/* Adjusts height accounting for title */}
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default IncomeExpenseChart;
