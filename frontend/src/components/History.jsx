import { useContext } from 'react';
import { AppContext } from '../context/AppContext';


function RecentTransactions() {
  const { incomeData, expenseData } = useContext(AppContext);

  // Combine and sort all transactions by date
  const allTransactions = [...incomeData, ...expenseData]
  .sort((a, b) => new Date(b.date) - new Date(a.date))
  .slice(0, 2);

  // Get the 5 most recent transactions
  const recentTransactions = allTransactions.slice(0, 5);

  return (
    <div className="w-full mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Recent Transactions</h1>
      {recentTransactions.length > 0 ? (
        <ul className="space-y-3">
          {recentTransactions.map((transaction) => (
            <li 
              key={transaction._id}
              className={`p-4 rounded-lg shadow ${
                transaction.type === 'income' 
                  ? 'bg-green-50' 
                  : 'bg-red-50'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{transaction.title}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(transaction.date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">{transaction.category}</p>
                </div>
                <div className={`font-bold ${
                  transaction.type === 'income' 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  ₹{transaction.amount}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-500">No transactions found</p>
      )}
     
    </div>
  );
}

export default RecentTransactions;