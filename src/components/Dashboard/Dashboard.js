import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
    // Add new state for budget
    const [budget, setBudget] = useState({
        amount: 0,
        month: new Date().toISOString().slice(0, 7)
    });
    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
    const [newTransaction, setNewTransaction] = useState({
        type: 'expense',
        category: '',
        amount: '',
        description: ''
    });
    const navigate = useNavigate();

    const categories = {
        income: ['Salary', 'Freelance', 'Investments', 'Other'],
        expense: ['Groceries', 'Rent', 'Utilities', 'Entertainment', 'Transport']
    };

 

    const fetchBudget = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/budget', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                const data = await response.json();
                setBudget(data);
            }
        } catch (error) {
            console.error('Error fetching budget:', error);
        }
    };
    const handleBudgetUpdate = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/budget', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(budget)
            });

            if (!response.ok) {
                throw new Error('Failed to update budget');
            }

            await fetchSummary();
        } catch (error) {
            console.error('Error updating budget:', error);
        }
    };
    const fetchTransactions = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/transactions', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch transactions');
            }
            const data = await response.json();
            setTransactions(Array.isArray(data.transactions) ? data.transactions : []);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            setTransactions([]);
        }
    };
    // Add these state declarations near the top with other state
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({
        category: '',
        startDate: '',
        endDate: '',
        minAmount: '',
        maxAmount: ''
    });
    const transactionsPerPage = 5;
    
    // Add this filtering logic before the return statement
    const filteredTransactions = transactions.filter(transaction => {
        const matchesCategory = !filters.category || transaction.category === filters.category;
        const matchesDate = (
            (!filters.startDate || new Date(transaction.date) >= new Date(filters.startDate)) &&
            (!filters.endDate || new Date(transaction.date) <= new Date(filters.endDate))
        );
        const matchesAmount = (
            (!filters.minAmount || transaction.amount >= parseFloat(filters.minAmount)) &&
            (!filters.maxAmount || transaction.amount <= parseFloat(filters.maxAmount))
        );
        return matchesCategory && matchesDate && matchesAmount;
    });
    
    // Add pagination calculations
    const indexOfLastTransaction = currentPage * transactionsPerPage;
    const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
    const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);


    const fetchSummary = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.log('No token found');
                navigate('/');
                return;
            }

            const response = await fetch('http://localhost:5000/api/transactions/summary', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
                // Removed credentials: 'include'
            });

            const data = await response.json();
            
            // Ensure we have all required fields
            const income = parseFloat(data.totalIncome || data.income || 0);
            const expense = parseFloat(data.totalExpense || data.expense || 0);
            const balance = income - expense;

            setSummary({
                income: income.toFixed(2),
                expense: expense.toFixed(2),
                balance: balance.toFixed(2)
            });
        } catch (error) {
            console.error('Detailed error:', {
                message: error.message,
                stack: error.stack
            });
            setSummary({ income: '0.00', expense: '0.00', balance: '0.00' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    ...newTransaction,
                    amount: parseFloat(newTransaction.amount)
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create transaction');
            }

            setNewTransaction({
                type: 'expense',
                category: '',
                amount: '',
                description: ''
            });
            
            await fetchTransactions();
            await fetchSummary();
        } catch (error) {
            console.error('Error creating transaction:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/');
    };
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }
        fetchTransactions();
        fetchSummary();
        fetchBudget();
    }, []);
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

    // Update the pieData definition
    const pieData = [
        { name: 'Income', value: parseFloat(summary.income) },
        { name: 'Expenses', value: parseFloat(summary.expense) }
    ].filter(item => item.value > 0);

    // Update the chart section in the return statement
    <div className="dashboard-chart">
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={60}
                    fill="#8884d8"
                    label={({ name, value }) => `${name}: $${value.toLocaleString()}`}
                >
                    {pieData.map((entry, index) => (
                        <Cell 
                            key={`cell-${index}`} 
                            fill={entry.name === 'Income' ? '#00C49F' : '#FF8042'} 
                        />
                    ))}
                </Pie>
                <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value, entry) => `${value}: $${entry.payload.value.toLocaleString()}`}
                />
            </PieChart>
        </ResponsiveContainer>
    </div>

    // Add budget section to the dashboard summary
    return (
        <div className="dashboard-container">
            <nav className="dashboard-nav">
                <h1>Budget Tracker</h1>
                <button onClick={handleLogout}>Logout</button>
            </nav>

            <div className="budget-section">
                <h2>Monthly Budget</h2>
                <div className="budget-form">
                    <input
                        type="number"
                        value={budget.amount}
                        onChange={(e) => setBudget({...budget, amount: e.target.value})}
                        placeholder="Set monthly budget"
                    />
                    <input
                        type="month"
                        value={budget.month}
                        onChange={(e) => setBudget({...budget, month: e.target.value})}
                    />
                    <button onClick={handleBudgetUpdate}>Set Budget</button>
                </div>
                <div className="budget-progress">
                    <h3>Budget Progress</h3>
                    <div className="progress-bar">
                        <div 
                            className="progress" 
                            style={{
                                width: `${Math.min((summary.expense / budget.amount) * 100, 100)}%`,
                                backgroundColor: summary.expense > budget.amount ? '#ff4444' : '#4CAF50'
                            }}
                        ></div>
                    </div>
                    <p>Spent: ${summary.expense} of ${budget.amount}</p>
                </div>
            </div>

            <div className="dashboard-summary">
                <div className="summary-card">
                    <h3>Income</h3>
                    <p className="amount income">${summary.income}</p>
                </div>
                <div className="summary-card">
                    <h3>Expenses</h3>
                    <p className="amount expense">${summary.expense}</p>
                </div>
                <div className="summary-card">
                    <h3>Balance</h3>
                    <p className="amount">${summary.balance}</p>
                </div>
            </div>

            <div className="dashboard-chart">
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={pieData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="transaction-form">
                <h2>Add New Transaction</h2>
                <form onSubmit={handleSubmit}>
                    <select
                        value={newTransaction.type}
                        onChange={(e) => setNewTransaction({
                            ...newTransaction,
                            type: e.target.value,
                            category: ''
                        })}
                    >
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                    </select>

                    <select
                        value={newTransaction.category}
                        onChange={(e) => setNewTransaction({
                            ...newTransaction,
                            category: e.target.value
                        })}
                        required
                    >
                        <option value="">Select Category</option>
                        {categories[newTransaction.type].map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>

                    <input
                        type="number"
                        placeholder="Amount"
                        value={newTransaction.amount}
                        onChange={(e) => setNewTransaction({
                            ...newTransaction,
                            amount: e.target.value
                        })}
                        required
                    />

                    <input
                        type="text"
                        placeholder="Description"
                        value={newTransaction.description}
                        onChange={(e) => setNewTransaction({
                            ...newTransaction,
                            description: e.target.value
                        })}
                        required
                    />

                    <button type="submit">Add Transaction</button>
                </form>
            </div>

            {/* Add filter controls before transactions list */}
            <div className="transaction-filters">
                <select 
                    value={filters.category}
                    onChange={(e) => setFilters({...filters, category: e.target.value})}
                >
                    <option value="">All Categories</option>
                    {[...categories.income, ...categories.expense].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
                <input 
                    type="date" 
                    value={filters.startDate}
                    onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                    placeholder="Start Date"
                />
                <input 
                    type="date" 
                    value={filters.endDate}
                    onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                    placeholder="End Date"
                />
                <div className="amount-filter">
                    <input 
                        type="number" 
                        value={filters.minAmount}
                        onChange={(e) => setFilters({...filters, minAmount: e.target.value})}
                        placeholder="Min Amount"
                    />
                    <span>to</span>
                    <input 
                        type="number" 
                        value={filters.maxAmount}
                        onChange={(e) => setFilters({...filters, maxAmount: e.target.value})}
                        placeholder="Max Amount"
                    />
                </div>
            </div>

            <div className="transactions-list">
                <h2>Recent Transactions</h2>
                <div className="transactions-table">
                    {currentTransactions.map(transaction => (
                        <div key={transaction._id} className="transaction-item">
                            <div className="transaction-info">
                                <h4>{transaction.description}</h4>
                                <p>{transaction.category}</p>
                            </div>
                            <p className={`amount ${transaction.type}`}>
                                {transaction.type === 'expense' ? '-' : '+'}${transaction.amount}
                            </p>
                        </div>
                    ))}
                </div>
                
                {/* Add pagination controls */}
                {filteredTransactions.length > transactionsPerPage && (
                    <div className="pagination">
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        
                        {Array.from({length: Math.ceil(filteredTransactions.length / transactionsPerPage)}, (_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => setCurrentPage(i + 1)}
                                className={currentPage === i + 1 ? 'active' : ''}
                            >
                                {i + 1}
                            </button>
                        ))}
                        
                        <button 
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredTransactions.length / transactionsPerPage)))}
                            disabled={currentPage === Math.ceil(filteredTransactions.length / transactionsPerPage)}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
