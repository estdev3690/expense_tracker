const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Changed from /api/register to /api/users/register
            const response = await fetch('http://localhost:5000/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(credentials)
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData);
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