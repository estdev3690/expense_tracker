const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        // Changed from /api/register to /api/users/register
        const response = await fetch('https://expense-tracker-4mo8.onrender.com/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(credentials),
            mode: 'cors' 
        });

        if (!response.ok) {
            // Handle non-200 responses
            const errorData = await response.json(); // assuming the server returns JSON error messages
            throw new Error(errorData.message || 'An unknown error occurred');
        }

        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId);
        navigate('/dashboard');
    } catch (error) {
        console.error('Registration error:', error);
        setError('Registration failed. Please try again.');
    }
};
