const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const Budget = require('./models/Budget'); // Add this line
const allowedOrigins = [
    'https://expense-tracker-01-tau.vercel.app',
    'http://localhost:3000' // For local development
];
// Update CORS configuration
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));
app.get('/healthz', (req, res) => {
    res.status(200).send('OK');
});
app.post('/api/register', async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({
            fullName,
            email,
            password: hashedPassword
        });

        await user.save();

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({ token, userId: user._id });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token, userId: user._id });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Transaction routes
app.post('/api/transactions', authenticateToken, async (req, res) => {
    try {
        const transaction = new Transaction({
            ...req.body,
            userId: req.user.userId
        });
        await transaction.save();
        res.status(201).json(transaction);
    } catch (error) {
        res.status(500).json({ message: 'Error creating transaction' });
    }
});

app.get('/api/transactions', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, category, type, startDate, endDate } = req.query;
        const query = { userId: req.user.userId };

        if (category) query.category = category;
        if (type) query.type = type;
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const transactions = await Transaction.find(query)
            .sort({ date: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Transaction.countDocuments(query);

        res.json({
            transactions,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transactions' });
    }
});

// Update login route
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token, userId: user._id });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update register route
app.post('/api/auth/register', async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({
            fullName,
            email,
            password: hashedPassword
        });

        await user.save();

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({ token, userId: user._id });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update summary route
app.get('/api/transactions/summary', authenticateToken, async (req, res) => {
    try {
        const currentMonth = new Date();
        currentMonth.setDate(1);
        currentMonth.setHours(0, 0, 0, 0);

        const summary = await Transaction.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(req.user.userId),
                    date: { $gte: currentMonth }
                }
            },
            {
                $group: {
                    _id: '$type',
                    total: { $sum: '$amount' }
                }
            }
        ]);

        const result = {
            income: 0,
            expense: 0,
            balance: 0
        };

        summary.forEach(item => {
            if (item._id === 'income') {
                result.income = item.total;
            } else if (item._id === 'expense') {
                result.expense = item.total;
            }
        });

        result.balance = result.income - result.expense;

        res.json(result);
    } catch (error) {
        console.error('Summary error:', error);
        res.status(500).json({ message: 'Error fetching summary' });
    }
});

// Budget routes
app.get('/api/budget', authenticateToken, async (req, res) => {
    try {
        const budget = await Budget.findOne({ userId: req.user.userId });
        if (!budget) {
            return res.json({
                amount: 0,
                month: new Date().toISOString().slice(0, 7)
            });
        }
        res.json(budget);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching budget' });
    }
});

app.post('/api/budget', authenticateToken, async (req, res) => {
    try {
        const { amount, month } = req.body;
        let budget = await Budget.findOne({ userId: req.user.userId });

        if (budget) {
            budget.amount = amount;
            budget.month = month;
        } else {
            budget = new Budget({
                userId: req.user.userId,
                amount,
                month
            });
        }

        await budget.save();
        res.json(budget);
    } catch (error) {
        res.status(500).json({ message: 'Error updating budget' });
    }
});

app.get('/api/transactions', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, category, type, startDate, endDate } = req.query;
        const query = { userId: req.user.userId };

        if (category) query.category = category;
        if (type) query.type = type;
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const transactions = await Transaction.find(query)
            .sort({ date: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Transaction.countDocuments(query);

        res.json({
            transactions,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transactions' });
    }
});

// Update login route
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token, userId: user._id });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update register route
app.post('/api/auth/register', async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({
            fullName,
            email,
            password: hashedPassword
        });

        await user.save();

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({ token, userId: user._id });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update summary route
app.get('/api/transactions/summary', authenticateToken, async (req, res) => {
    try {
        const currentMonth = new Date();
        currentMonth.setDate(1);
        currentMonth.setHours(0, 0, 0, 0);

        const summary = await Transaction.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(req.user.userId),
                    date: { $gte: currentMonth }
                }
            },
            {
                $group: {
                    _id: '$type',
                    total: { $sum: '$amount' }
                }
            }
        ]);

        const result = {
            income: 0,
            expense: 0,
            balance: 0
        };

        summary.forEach(item => {
            if (item._id === 'income') {
                result.income = item.total;
            } else if (item._id === 'expense') {
                result.expense = item.total;
            }
        });

        result.balance = result.income - result.expense;

        res.json(result);
    } catch (error) {
        console.error('Summary error:', error);
        res.status(500).json({ message: 'Error fetching summary' });
    }
});

// Add this route with your other transaction routes
app.delete('/api/transactions/:id', authenticateToken, async (req, res) => {
    try {
        const transaction = await Transaction.findOne({
            _id: req.params.id,
            userId: req.user.userId
        });

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        await Transaction.findByIdAndDelete(req.params.id);
        res.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ message: 'Error deleting transaction' });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});