import React, { useState } from 'react';
import axios from 'axios';
import classes from './registerPage.module.css';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Handle input change
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [id]: value,
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check if passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            const response = await axios.post('http://localhost:3000/auth/register', {
                name: formData.name,
                surname: formData.surname,
                email: formData.email,
                contact_info: formData.phone,
                password: formData.password,
            });

            // Handle success
            setSuccess('User registered successfully!');
            setError('');
            setFormData({
                name: '',
                surname: '',
                email: '',
                phone: '',
                password: '',
                confirmPassword: '',
            });
        } catch (err) {
            // Handle error
            setError(err.response?.data?.message || 'Something went wrong');
            setSuccess('');
        }
    };

    return (
        <div className={classes.registerPage}>
            <div className={classes.logo}>YellowShop</div>
            <form className={classes.registerForm} onSubmit={handleSubmit}>
                <div className={classes.formGroup}>
                    <label htmlFor="name">Name</label>
                    <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your name"
                        required
                    />
                </div>
                <div className={classes.formGroup}>
                    <label htmlFor="surname">Surname</label>
                    <input
                        type="text"
                        id="surname"
                        value={formData.surname}
                        onChange={handleChange}
                        placeholder="Enter your surname"
                        required
                    />
                </div>
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
                    <label htmlFor="phone">Phone Number</label>
                    <input
                        type="tel"
                        id="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
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
                <div className={classes.formGroup}>
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm your password"
                        required
                    />
                </div>
                <button type="submit" className={classes.signUpButton}>
                    Sign Up
                </button>
                {error && <p className={classes.error}>{error}</p>}
                {success && <p className={classes.success}>{success}</p>}
            </form>
        </div>
    );
}

