import { useContext } from "react";
import Chart from "../components/Chart";
import { AppContext } from "../context/AppContext";
// import Chart from '../components/Chart';

export default function DashboardSummary() {
  const { incomeData, expenseData } = useContext(AppContext);

  const totalIncome = incomeData.reduce(
    (sum, item) => sum + parseFloat(item.amount),
    0
  );
  const totalExpense = expenseData.reduce(
    (sum, item) => sum + parseFloat(item.amount),
    0
  );
  const totalBalance = totalIncome - totalExpense;

  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 md:gap-6 mt-5">
        {[
          { label: "Total Income", value: totalIncome, color: "text-green-600" },
          { label: "Total Expense", value: totalExpense, color: "text-red-600" },
          {
            label: "Total Balance",
            value: totalBalance,
            color: totalBalance < 0 ? "text-red-600" : "text-green-600",
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="flex-1 min-w-[200px] max-w-[400px] bg-gray-50 rounded-lg p-5 shadow-md text-center"
          >
            <h2 className="m-0 text-lg md:text-xl text-gray-800">
              {label}
            </h2>
            <p className={`mt-2 text-2xl md:text-3xl font-bold ${color}`}>
              ${value.toFixed(2)}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-10">
        <Chart incomeData={incomeData} expenseData={expenseData} />
      </div>
    </div>
  );
}
