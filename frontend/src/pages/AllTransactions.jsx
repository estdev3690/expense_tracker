import { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

function AllTransactions() {
  const { incomeData, expenseData, fetchIncome, fetchExpense } =
    useContext(AppContext);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const getToken = () => {
    return localStorage.getItem("token");
  };

  const handleDownload = () => {
    const headers = ["Type", "Title", "Amount", "Category", "Date", "Description"];
    const csvContent = [
      headers.join(","),
      ...allTransactions.map(transaction => 
        [
          `"${transaction.type}"`,
          `"${transaction.title}"`,
          transaction.amount,
          `"${transaction.category}"`,
          `"${new Date(transaction.date).toLocaleDateString()}"`,
          `"${transaction.description || ''}"`
        ].join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "transactions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (id, type) => {
    try {
      const utoken = getToken();
      if (!utoken) {
        toast.error("Authentication token not found");
        return;
      }

      const endpoint = type === "Income" ? "delete-income" : "delete-expense";
      const { data } = await axios.delete(
        `https://expense-tracker-1-kap5.onrender.com/api/user/${endpoint}/${id}`,
        {
          headers: {
            Authorization: `Bearer ${utoken}`,
          },
        }
      );

      if (data.success) {
        toast.success(`${type} deleted successfully`);
        fetchIncome();
        fetchExpense();
        try {
          await fetchIncome();
          await fetchExpense();
        } catch (fetchError) {
          console.error("Error refreshing data:", fetchError);
        }
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        toast.error("Session expired. Please login again.");
      } else {
        toast.error(`Failed to delete ${type}`);
      }
      console.error(error);
    }
  };
  const handleUpdate = async (updatedTransaction) => {
    try {
      const utoken = getToken();
      if (!utoken) {
        toast.error("Authentication token not found");
        return;
      }

      const { _id, type, title, amount, category, date, description } =
        updatedTransaction;
      const endpoint = type === "Income" ? "update-income" : "update-expense";

      const { data } = await axios.put(
        `https://expense-tracker-1-kap5.onrender.com/api/user/${endpoint}/${_id}`,
        {
          title,
          amount,
          category,
          date,
          description,
        },
        {
          headers: {
            Authorization: `Bearer ${utoken}`,
          },
        }
      );

      if (data.success) {
        toast.success(`${type} updated successfully`);
        await fetchIncome();
        await fetchExpense();
      } else {
        toast.error(`Failed to update ${type}`);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        toast.error("Session expired. Please login again.");
      } else {
        toast.error(`Failed to update ${updatedTransaction.type}`);
      }
      console.error("Update error:", error);
    }
  };

  // Combine and sort by date (newest first) while maintaining original order for same dates
  const allTransactions = [...incomeData, ...expenseData]
    .map((item) => ({
      ...item,
      type: incomeData.some((income) => income._id === item._id)
        ? "Income"
        : "Expense",
      dateObj: new Date(item.date),
    }))
    .sort((a, b) => b.dateObj - a.dateObj);

  return (
    <div className="w-full mx-auto p-4 bg-white rounded-xl shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">All Transactions</h1>
        <button
          onClick={handleDownload}
          className="px-4 my-2 py-2 bg-green-600 text-white rounded hover:bg-green-700 w-full sm:w-auto"
        >
          Download CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 hidden sm:table-header-group">
            <tr>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {allTransactions.map((transaction) => (
              <tr
                key={transaction._id}
                className={`${transaction.type === "Income" ? "bg-green-50" : "bg-orange-50"} block sm:table-row mb-4 sm:mb-0`}
              >
                <td className="px-3 sm:px-6 py-4 block sm:table-cell">
                  <span className="font-semibold sm:hidden">Type: </span>
                  {transaction.type}
                </td>
                <td className="px-3 sm:px-6 py-4 block sm:table-cell">
                  <span className="font-semibold sm:hidden">Title: </span>
                  {transaction.title}
                </td>
                <td className="px-3 sm:px-6 py-4 block sm:table-cell">
                  <span className="font-semibold sm:hidden">Amount: </span>
                  ${transaction.amount}
                </td>
                <td className="px-3 sm:px-6 py-4 block sm:table-cell">
                  <span className="font-semibold sm:hidden">Category: </span>
                  {transaction.category}
                </td>
                <td className="px-3 sm:px-6 py-4 block sm:table-cell">
                  <span className="font-semibold sm:hidden">Date: </span>
                  {new Date(transaction.date).toLocaleDateString()}
                </td>
                <td className="px-3 sm:px-6 py-4 block sm:table-cell">
                  <span className="font-semibold sm:hidden">Description: </span>
                  {transaction.description}
                </td>
                <td className="px-3 sm:px-6 py-4 block sm:table-cell">
                  <span className="font-semibold sm:hidden">Actions: </span>
                  <div className="flex flex-wrap gap-2 mt-2 sm:mt-0 sm:space-x-2">
                    <button
                      onClick={() => {
                        setSelectedTransaction(transaction);
                        setIsModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 px-2 py-1 sm:px-0 sm:py-0"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        handleDelete(transaction._id, transaction.type)
                      }
                      className="text-red-600 hover:text-red-900 px-2 py-1 sm:px-0 sm:py-0"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className=" rounded-lg p-6 w-full max-w-md mx-4" style={{background:"lightgray"}}>
            <h2 className="text-xl font-semibold mb-4">
              Edit {selectedTransaction?.type}
            </h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await handleUpdate(selectedTransaction);
                setIsModalOpen(false);
              }}
            >
              <div className="mb-4">
                <label className="block text-gray-700">Title</label>
                <input
                  type="text"
                  value={selectedTransaction?.title || ""}
                  onChange={(e) =>
                    setSelectedTransaction({
                      ...selectedTransaction,
                      title: e.target.value,
                    })
                  }
                  className="w-full border border-white-300 px-3 py-2 rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Amount</label>
                <input
                  type="number"
                  value={selectedTransaction?.amount || ""}
                  onChange={(e) =>
                    setSelectedTransaction({
                      ...selectedTransaction,
                      amount: e.target.value,
                    })
                  }
                  className="w-full border border-white-300 px-3 py-2 rounded"
                />
              </div>
              {/* Add more fields as needed */}
              <div className="flex justify-end">
                <button
                  type="button"
                  className="mr-2 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AllTransactions;
