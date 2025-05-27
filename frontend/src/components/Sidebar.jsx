import {
  FaHome,
  FaPlusCircle,
  FaMinusCircle,
  FaReceipt,
  FaSignOutAlt,
  FaSignInAlt,
  FaWallet
} from "react-icons/fa";

import { NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import cookie from "js-cookie";

const Sidebar = () => {
  const { token, setToken } = useContext(AppContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    setToken(false);
    cookie.remove("token");
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-gray-900 text-white z-50">
      <div className="flex items-center justify-between p-2 md:p-4">
        <h1 className="text-xl md:text-2xl font-bold">
          <span className="md:hidden"><FaWallet className="md:hidden w-6 h-6 text-red-500" /></span>
          <span className="hidden md:inline">Expense Tracker</span>
        </h1>
        
        <div className="flex items-center space-x-1 md:space-x-4 overflow-x-auto">
          <NavLink
            to="/"
            className="flex flex-col items-center p-2 hover:bg-gray-800 rounded transition min-w-[60px]"
          >
            <FaHome className="w-5 h-5" />
            <span className="text-xs">Dashboard</span>
          </NavLink>

          <NavLink
            to="/add-income"
            className="flex flex-col items-center p-2 hover:bg-gray-800 rounded transition min-w-[60px]"
          >
            <FaPlusCircle className="w-5 h-5" />
            <span className="text-xs">Income</span>
          </NavLink>

          <NavLink
            to="/add-expense"
            className="flex flex-col items-center p-2 hover:bg-gray-800 rounded transition min-w-[60px]"
          >
            <FaMinusCircle className="w-5 h-5" />
            <span className="text-xs">Expense</span>
          </NavLink>

          <NavLink
            to="/allTransactions"
            className="flex flex-col items-center p-2 hover:bg-gray-800 rounded transition min-w-[60px]"
          >
            <FaReceipt className="w-5 h-5" />
            <span className="text-xs">Transactions</span>
          </NavLink>

          {token ? (
            <button
              onClick={handleLogout}
              className="flex flex-col items-center p-2 hover:bg-gray-800 rounded transition min-w-[60px]"
            >
              <FaSignOutAlt className="w-5 h-5" />
              <span className="text-xs">Logout</span>
            </button>
          ) : (
            <NavLink
              to="/login"
              className="flex flex-col items-center p-2 hover:bg-gray-800 rounded transition min-w-[60px]"
            >
              <FaSignInAlt className="w-5 h-5" />
              <span className="text-xs">Login</span>
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
