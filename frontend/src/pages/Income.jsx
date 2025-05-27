import { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";

export default function AddIncomeForm() {
  const { addIncome } = useContext(AppContext);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    type: "",
    category: "",
    description: "",
    date: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = Number(formData.amount);
    addIncome(
      formData.title,
      amount,
      "income", // Set type as "income"
      formData.category,
      formData.description,
      formData.date
    ); 
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded-xl shadow-md">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800">Add Income</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter Income title"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Amount
          </label>
          <input
            type="number"
            name="amount"
            onChange={handleChange}
            value={formData.amount}
            placeholder="Enter amount"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Income Type
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>
              Select Type
            </option>
            <option value="salary">salary</option>
            <option value="Business">Business</option>
            <option value="Investment">Investment</option>
            <option value="Freelance">Freelance</option>
            <option value="RentalIncome">Rental Income</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Category Type
          </label>
          <select
            name="category"
            required
            onChange={handleChange}
            value={formData.category}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>
              Select Category
            </option>
            <option value="MonthlySalary">Monthly Salary</option>
            <option value="Dividends">Dividends</option>
            <option value="Consulting">Consulting</option>
            <option value="RealEstate">Real Estate</option>
            <option value="SideHustle">Side Hustle</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            placeholder="Enter description"
            rows="3"
            onChange={handleChange}
            required
            value={formData.description}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Date
          </label>
          <input
            type="date"
            name="date"
            onChange={handleChange}
            required
            value={formData.date}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
