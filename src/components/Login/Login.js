import React, { useState } from 'react';
import './Login.css';

const Login = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [timer, setTimer] = useState(20); // Start from 20 seconds
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const toggleForm = () => {
        setIsSignUp(!isSignUp);
        setError('');
        setSuccessMessage('');
        setFormData({ fullName: '', email: '', password: '' });
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Update in handleSubmit function
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setIsLoading(true);
        setTimer(20); // Reset to 20 seconds
    
        const timerInterval = setInterval(() => {
            setTimer(prev => {
                if (prev <= 0) {
                    clearInterval(timerInterval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    
        try {
            const endpoint = isSignUp ? '/api/register' : '/api/login';
            const response = await fetch(`https://expense-tracker-4mo8.onrender.com${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(isSignUp ? formData : {
                    email: formData.email,
                    password: formData.password
                }),
                mode: 'cors'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'An error occurred');
            }

            if (isSignUp) {
                setSuccessMessage('Registration successful! Please sign in.');
                setTimeout(() => {
                    setIsSignUp(false);
                    setFormData({ fullName: '', email: '', password: '' });
                    setSuccessMessage('');
                }, 2000);
            } else {
                localStorage.setItem('token', data.token);
                localStorage.setItem('userId', data.userId);
                window.location.href = '/dashboard';
            }
        } catch (err) {
            setError(err.message || 'Failed to connect to server. Please try again later.');
        } finally {
            setIsLoading(false);
            clearInterval(timerInterval);
            setTimer(20); // Reset timer
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>{isSignUp ? 'Sign Up' : 'Login'}</h2>
                {error && <div className="error-message">{error}</div>}
                {successMessage && <div className="success-message">{successMessage}</div>}
                <form className="login-form" onSubmit={handleSubmit}>
                    {isSignUp && (
                        <div className="form-group">
                            <input
                                type="text"
                                name="fullName"
                                placeholder="Full Name"
                                required
                                autoComplete="off"
                                value={formData.fullName}
                                onChange={handleChange}
                            />
                        </div>
                    )}
                    <div className="form-group">
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            required
                            autoComplete="off"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            required
                            autoComplete="new-password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>
                    <button
                        type="submit"
                        className={`submit-btn ${isLoading ? 'loading' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? `Please wait... ${timer}s` : (isSignUp ? 'Sign Up' : 'Sign In')}
                    </button>
                </form>
                <p className="toggle-text">
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                    <span onClick={!isLoading ? toggleForm : undefined}
                        className={`toggle-link ${isLoading ? 'disabled' : ''}`}>
                        {isSignUp ? ' Sign In' : ' Sign Up'}
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Login;