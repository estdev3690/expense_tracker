import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

export default function Login() {
  const navigate = useNavigate();
  const {handleLogin} = useContext(AppContext);
  const [isModal, setIsModal] = useState(true);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleModalClose = () => {
    setIsModal(false);
    navigate("/");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin(formData.email, formData.password);
    setIsModal(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 bg-opacity-90">
      {isModal && (
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8 relative animate-fade-in">
          <button
            onClick={handleModalClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-xl"
          >
            &times;
          </button>
          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Login</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-gray-700 font-medium mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Submit
            </button>
          </form>
          <p className="text-center mt-4 text-gray-600">
            Don&apos;t have an account?{" "}
            <button
              onClick={() => navigate("/register")}
              className="text-blue-600 hover:underline"
            >
              Register
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
