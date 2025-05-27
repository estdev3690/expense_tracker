import { ToastContainer } from "react-toastify";
import { useLocation } from "react-router-dom";
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import History from "./components/History";
import { useContext } from "react";
import { AppContext } from "./context/AppContext";


import Income from "./pages/Income";
import Expenses from "./pages/Expense";
import AllTransactions from "./pages/AllTransactions";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { useEffect } from "react";
import PieChart from "./components/PieChart";


const App = () => {
  const location = useLocation();
  const { token, fetchIncome, fetchExpense } = useContext(AppContext);
  const hideMainLayout = [
    "/add-income",
    "/add-expense",
    "/allTransactions",
    "/login",
    "/register",
  ].includes(location.pathname);

  useEffect(() => {
    fetchExpense();
    fetchIncome();
  }, [token, location.pathname]);

  return (
    <div className="flex flex-col">
      <ToastContainer />
      {/* Changed Sidebar to fixed top navbar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Sidebar />
      </div>
      
      {/* Added margin-top to push content below navbar */}
      {!hideMainLayout ? (
        <div className="flex flex-col lg:flex-row w-full overflow-auto mt-16">
          <div className="w-full lg:w-1/2 p-4">
            <Routes>
              <Route path="/" element={<Dashboard />} />
            </Routes>
          </div>
          <div className="w-full lg:w-1/2 p-4 flex flex-col gap-4">
            <Routes>
              <Route path="/" element={<History />} />
            </Routes>
            <Routes>
              <Route path="/" element={<PieChart />} />
            </Routes>
          </div>
        </div>
      ) : (
        <div className="w-full overflow-auto mt-16">
          <Routes>
            <Route path="/add-income" element={<Income />} />
            <Route path="/add-expense" element={<Expenses />} />
            <Route path="/allTransactions" element={<AllTransactions />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </div>
      )}
    </div>
  );
};

export default App;
