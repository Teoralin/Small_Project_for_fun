import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import classes from './LoginPage.module.css';
import Key from "../../assets/Key.png";
import MailIcon from "../../assets/Mail.png";
import { jwtDecode } from 'jwt-decode';


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
            const token = localStorage.getItem("token");
            console.log(token);
            // Call the login function from UserContext to update the global state
            const decodedToken = jwtDecode(response.data.token);
            console.log(decodedToken);

            navigate('/');

            //login(decodedToken.name); // Pass the user's name to the login function
            console.log(decodedToken.name);

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
                    <div className={classes.form}>
                        <img
                            src={MailIcon}
                            alt="Mail Icon"
                            className={classes.icon}
                        />
                        <input
                            type="email"
                            id="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                </div>
                <div className={classes.formGroup}>
                    <label htmlFor="password">Password</label>
                    <div className={classes.form}>
                        <img
                            src={Key}
                            alt="Key Icon"
                            className={classes.icon}
                        />
                        <input
                            type="password"
                            id="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                        />
                    </div>
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