const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Changed from /api/login to /api/users/login
            const response = await fetch('http://localhost:5000/api/users/login', {
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
            console.error('Login error:', error);
            setError('Login failed. Please try again.');
        }
    };