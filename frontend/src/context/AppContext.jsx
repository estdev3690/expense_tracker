import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import cookie from "js-cookie";
import axios from "axios";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import { useEffect } from "react";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const [expenseData, setExpenseData] = useState([]);
  const [incomeData, setIncomeData] = useState([]);
  const [token, setToken] = useState(Boolean(cookie.get("token")));

  const backendUrl = "https://expense-tracker-1-kap5.onrender.com";


  const handleRegister = async (name,email,password) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/register`,
        { name, email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (data.success) {
        cookie.set("token", data.token, { expires: 7 });
        setToken(true);
        fetchExpense();
        fetchIncome();
        toast.success(data.message || "User Registered Successfully");
        navigate("/");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleLogin = async (email,password) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/login`,
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (data.success) {
        // Store token in localStorage instead of cookie
        localStorage.setItem('token', data.token);
        setToken(true);
        
        // Verify token storage
        console.log("Token verification:", {
          received: data.token,
          saved: localStorage.getItem('token')
        });

        // Set default authorization header
        axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

        fetchExpense();
        fetchIncome();
        toast.success(data.message || "User login Successfully");
        navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed: " + (error.response?.data?.message || error.message));
    }
  };

  // Update getToken to only use localStorage
  const getToken = () => {
    return localStorage.getItem('token');
  };
  const fetchIncome = async () => {
    try {
      const utoken = getToken();
      if (!utoken) {
        toast.error("Authentication token not found");
        return;
      }
  
      const decodedToken = jwtDecode(utoken);
      const userId = decodedToken?.id;
      if (!userId) return;
  
      const { data } = await axios.get(`${backendUrl}/api/user/get-income`, {
        headers: {
          Authorization: `Bearer ${utoken}`,
        },
      });
  
      if (data.success) {
        setIncomeData(data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  
  const fetchExpense = async () => {
    try {
      const utoken = getToken();
      if (!utoken) {
        toast.error("Authentication token not found");
        return;
      }
  
      const decodedToken = jwtDecode(utoken);
      const userId = decodedToken?.id;
      if (!userId) return;
  
      const { data } = await axios.get(`${backendUrl}/api/user/get-expense`, {
        headers: {
          Authorization: `Bearer ${utoken}`,
        },
      });
  
      if (data.success) {
        setExpenseData(data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  // const utoken = cookie.get("token");  

  const addIncome = async (
    title,
    amount,
    income,
    category,
    description,
    date
  ) => {
    try {
      const utoken = getToken();
      if (!utoken) {
        toast.error("Authentication token not found");
        return;
      }
  
      const decodedToken = jwtDecode(utoken);
      const userId = decodedToken?.id;
      if (!userId) {
        toast.error("Invalid user token");
        return;
      }

      console.log("Sending data:", { title, amount, income, category, description, date });
      
      const { data } = await axios.post(
        `${backendUrl}/api/user/add-income`,
        { title, amount, income, category, description, date },
        {
          headers: {
            "Authorization": `Bearer ${utoken}`,
            "Content-Type": "application/json"
          },
        }
      );

      if (data.success) {
        toast.success(data.message);
        fetchIncome();
        navigate("/");
      }
    } catch (error) {
      console.error("Error details:", error.response || error);
      toast.error(error.response?.data?.message || "Error adding income");
    }
  };

  const addExpense = async (
    title,
    amount,
    income,
    category,
    description,
    date
  ) => {
    try {
      const utoken = getToken();
      if (!utoken) {
        toast.error("Authentication token not found");
        return;
      }
  
      const decodedToken = jwtDecode(utoken);
      const userId = decodedToken?.id;
      if (!userId) return;
      const { data } = await axios.post(
        `${backendUrl}/api/user/add-expense`,
        { title, amount, income, category, description, date },
        {
          headers: {
               Authorization: `Bearer ${utoken}`,
          },
        }
      );
      if (data.success) {
        toast.success(data.message);
        fetchExpense();
        navigate("/");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchExpense();
    fetchIncome();
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (token && storedToken) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  const values = {
    backendUrl,
    handleRegister,
    handleLogin,
    fetchExpense,
    fetchIncome,
    addIncome,
    addExpense,
    incomeData,
    expenseData,
    token,
    setToken,
  };
  return <AppContext.Provider value={values}>{children}</AppContext.Provider>;
};
export default AppContextProvider;
