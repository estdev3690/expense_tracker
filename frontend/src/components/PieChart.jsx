import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

function PieChart() {
    const { incomeData, expenseData } = useContext(AppContext);

    // Calculate totals
    const totalIncome = incomeData.reduce((sum, item) => sum + Number(item.amount), 0);
    const totalExpense = expenseData.reduce((sum, item) => sum + Number(item.amount), 0);
    const balance = totalIncome - totalExpense;

    // Calculate category totals
    const incomeByCategory = incomeData.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + Number(item.amount);
        return acc;
    }, {});

    const expenseByCategory = expenseData.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + Number(item.amount);
        return acc;
    }, {});

    const data = {
        labels: [
            'Total Balance',
            'Total Income',
            'Total Expense',
            ...Object.keys(incomeByCategory),
            ...Object.keys(expenseByCategory)
        ],
        datasets: [{
            data: [
                balance,
                totalIncome,
                totalExpense,
                ...Object.values(incomeByCategory),
                ...Object.values(expenseByCategory)
            ],
            backgroundColor: [
                '#3b82f6', // blue for balance
                '#22c55e', // green for income
                '#ef4444', // red for expense
                // Colors for categories
                '#84cc16', '#14b8a6', '#6366f1', '#d946ef',
                '#f97316', '#06b6d4', '#8b5cf6', '#ec4899'
            ],
            borderWidth: 1
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false, // Add this to prevent automatic resizing
        plugins: {
            legend: {
                position: 'right'
            },
            tooltip: {
                callbacks: {
                    label: (context) => `₹${context.parsed.toFixed(2)}`
                }
            }
        }
    };

    return (
        <div className="w-full mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4 ">Transaction Distribution</h2>
            <div className="bg-white rounded-lg shadow p-4 h-[300px] lg:h-[450px]">
                <Pie data={data} options={options} />
            </div>
        </div>
    );
}

export default PieChart;