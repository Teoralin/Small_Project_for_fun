import React from 'react';
import { useNavigate } from 'react-router-dom';
import classes from './registerPage.module.css';

export default function RegisterPage() {
    const navigate = useNavigate();

    const handleSignUp = (event) => {
        event.preventDefault(); // Предотвращаем перезагрузку страницы
        navigate('/'); // Перенаправляем на главную страницу
    };

    return (
        <div className={classes.registerPage}>
            <div className={classes.logo}>YellowShop</div>
            <form className={classes.registerForm} onSubmit={handleSignUp}>
                <div className={classes.formGroup}>
                    <label htmlFor="name">Name</label>
                    <input
                        type="text"
                        id="name"
                        placeholder="Enter your name"
                        required
                    />
                </div>
                <div className={classes.formGroup}>
                    <label htmlFor="surname">Surname</label>
                    <input
                        type="text"
                        id="surname"
                        placeholder="Enter your surname"
                        required
                    />
                </div>
                <div className={classes.formGroup}>
                    <label htmlFor="email">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        placeholder="Enter your email"
                        required
                    />
                </div>
                <div className={classes.formGroup}>
                    <label htmlFor="phone">Phone Number</label>
                    <input
                        type="tel"
                        id="phone"
                        placeholder="Enter your phone number"
                        required
                    />
                </div>
                <div className={classes.formGroup}>
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        placeholder="Enter your password"
                        required
                    />
                </div>
                <div className={classes.formGroup}>
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        placeholder="Confirm your password"
                        required
                    />
                </div>
                <button type="submit" className={classes.signUpButton}>
                    Sign Up
                </button>
            </form>
        </div>
    );
}
