import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
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
    const [user, setUser] = useState({ name: '' });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('https://expense-tracker-4mo8.onrender.com/api/users/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }

                const data = await response.json();
                setUser({ name: data.name || 'User' }); // Provide a fallback name
            } catch (error) {
                console.error('Error fetching user data:', error);
                setUser({ name: 'User' }); // Set default name if fetch fails
            }
        };

        fetchUserData();
    }, []);
    // Define functions before useEffect
    const fetchBudget = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://expense-tracker-4mo8.onrender.com/api/budget', {
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
    }, []);
    const fetchTransactions = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://expense-tracker-4mo8.onrender.com/api/transactions', {
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
    }, []);
    const fetchSummary = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.log('No token found');
                navigate('/');
                return;
            }

            const response = await fetch('https://expense-tracker-4mo8.onrender.com/api/transactions/summary', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
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
    }, [navigate]);
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }
        fetchTransactions();
        fetchSummary();
        fetchBudget();
    }, [fetchTransactions, fetchSummary, fetchBudget, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://expense-tracker-4mo8.onrender.com/api/transactions', {
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

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

    const pieData = [
        { name: 'Income', value: parseFloat(summary.income) },
        { name: 'Expenses', value: parseFloat(summary.expense) }
    ].filter(item => item.value > 0);






    const handleBudgetUpdate = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://expense-tracker-4mo8.onrender.com/api/budget', {
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
    const handleDeleteTransaction = async (transactionId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://expense-tracker-4mo8.onrender.com/api/transactions/${transactionId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete transaction');
            }

            // Only refresh if delete was successful
            await fetchTransactions();
            await fetchSummary();
        } catch (error) {
            console.error('Error deleting transaction:', error);
            // Optionally add user notification here
            alert('Failed to delete transaction. Please try again.');
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




    // Update the chart section in the return statement

    return (
        <div className="dashboard-container">
            <nav className="dashboard-nav">
                <h1>Budget Tracker</h1>
                <div className="welcome-message">Welcome, {user.name || 'User'}</div>
                <button onClick={handleLogout}>Logout</button>
            </nav>

            <div className="dashboard-grid">
                <div className="grid-item summary-section">
                    <h2 className="section-title">Financial Overview</h2>
                    <div className="dashboard-summary">
                        <div className="summary-card">
                            <h3>Income</h3>
                            <p className="amount income">₹{summary.income}</p>
                        </div>
                        <div className="summary-card">
                            <h3>Expenses</h3>
                            <p className="amount expense">₹{summary.expense}</p>
                        </div>
                        <div className="summary-card">
                            <h3>Balance</h3>
                            <p className="amount">₹{summary.balance}</p>
                        </div>
                    </div>
                </div>

                <div className="grid-item chart-section">

                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={60}
                                innerRadius={40}
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

                <div className="grid-item budget-section">
                    <h3>Monthly Budget</h3>
                    <div className="budget-content">
                        <div className="budget-form">
                            <input
                                type="number"
                                value={budget.amount}
                                onChange={(e) => setBudget({ ...budget, amount: e.target.value })}
                                placeholder="Set monthly budget"
                            />
                            <input
                                type="month"
                                value={budget.month}
                                onChange={(e) => setBudget({ ...budget, month: e.target.value })}
                            />
                            <button onClick={handleBudgetUpdate}>Set Budget</button>
                        </div>
                        <div className="budget-progress">
                            <div className="progress-bar">
                                <div
                                    className="progress"
                                    style={{
                                        width: `${Math.min((summary.expense / budget.amount) * 100, 100)}%`,
                                        backgroundColor: summary.expense > budget.amount ? '#ff4444' : '#4CAF50'
                                    }}
                                ></div>
                            </div>
                            <p>Spent: ₹{summary.expense} of ₹{budget.amount}</p>
                        </div>
                    </div>
                </div>

                <div className="grid-item transaction-section">
                    <div className="transaction-header">
                        <h3>Add Transaction</h3>
                        <form onSubmit={handleSubmit} className="compact-form">
                            <div className="form-row">
                                <select
                                    value={newTransaction.type}
                                    onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value, category: '' })}>
                                    <option value="expense">Expense</option>
                                    <option value="income">Income</option>
                                </select>
                                <select
                                    value={newTransaction.category}
                                    onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                                    required>
                                    <option value="">Category</option>
                                    {categories[newTransaction.type].map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-row">
                                <input type="number" placeholder="Amount" value={newTransaction.amount}
                                    onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })} required />
                                <input type="text" placeholder="Description" value={newTransaction.description}
                                    onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })} required />
                                <button type="submit">Add</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <div className="transactions-container">
                <div className="transactions-header">

                    <div className="filter-section">
                        <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
                            <option value="">All Categories</option>
                            {[...categories.income, ...categories.expense].map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <div className="date-filters">
                            <input type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
                            <input type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
                        </div>
                        <div className="amount-filters">
                            <input type="number" placeholder="Min" value={filters.minAmount} onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })} />
                            <input type="number" placeholder="Max" value={filters.maxAmount} onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })} />
                        </div>
                    </div>

                    <div className="transactions-table">
                        <div className="table-header">
                            <div className="header-cell">Transaction Name</div>
                            <div className="header-cell">Type</div>
                            <div className="header-cell">Category</div>
                            <div className="header-cell">Amount</div>
                            <div className="header-cell">Date</div>
                            <div className="header-cell">Action</div>
                        </div>
                        {currentTransactions.map(transaction => (
                            <div key={transaction._id} className="table-row">
                                <div className="table-cell" data-label="Transaction Name">{transaction.description}</div>
                                <div className="table-cell" data-label="Type">{transaction.type}</div>
                                <div className="table-cell" data-label="Category">{transaction.category}</div>
                                <div className={`table-cell amount ${transaction.type}`} data-label="Amount" style={{ fontSize: "13px" }}>
                                    {transaction.type === 'expense' ? '-' : '+'}₹{transaction.amount}
                                </div>
                                <div className="table-cell" data-label="Date">
                                    {new Date(transaction.date).toLocaleDateString()}
                                </div>
                                <div className="table-cell" data-label="Action">
                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDeleteTransaction(transaction._id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredTransactions.length > transactionsPerPage && (
                        <div className="pagination">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>
                            {Array.from({ length: Math.ceil(filteredTransactions.length / transactionsPerPage) }, (_, i) => (
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
        </div >
    );
};

export default Dashboard;


