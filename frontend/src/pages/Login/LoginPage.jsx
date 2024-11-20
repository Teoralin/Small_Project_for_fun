import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import classes from './loginPage.module.css';

export default function LoginPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');

    // Handle input changes
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [id]: value,
        }));
    };

    // Handle form submission
    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:3000/auth/login', {
                email: formData.email,
                password: formData.password,
            });

            // Save the JWT token (in localStorage or cookies)
            localStorage.setItem('token', response.data.token);

            // Navigate to the home page
            navigate('/');
        } catch (err) {
            // Handle errors (e.g., invalid credentials)
            setError(err.response?.data?.message || 'Something went wrong');
        }
    };

    return (
        <div className={classes.loginPage}>
            <div className={classes.logo}>YellowShop</div>
            <form className={classes.loginForm} onSubmit={handleLogin}>
                <div className={classes.formGroup}>
                    <label htmlFor="email">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        required
                    />
                </div>
                <div className={classes.formGroup}>
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        required
                    />
                </div>
                <button type="submit" className={classes.loginButton}>
                    Log In
                </button>
                {error && <p className={classes.error}>{error}</p>}
            </form>
            <div className={classes.registerLink}>
                <p>Don&#39;t have an account?</p>
                <Link to="/register">Register here</Link>
            </div>
        </div>
    );
}

