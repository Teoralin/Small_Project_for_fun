import React from 'react';
import { Link } from 'react-router-dom';
import classes from './loginPage.module.css';

export default function LoginPage() {
    return (
        <div className={classes.loginPage}>
            <div className={classes.logo}>YellowShop</div>
            <form className={classes.loginForm}>
                <div className={classes.formGroup}>
                    <label htmlFor="email">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        placeholder="Enter your email"
                    />
                </div>
                <div className={classes.formGroup}>
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        placeholder="Enter your password"
                    />
                </div>
                <button type="button" className={classes.loginButton}>
                    Log In
                </button>
            </form>
            <div className={classes.registerLink}>
                <p>Don't have an account?</p>
                <Link to="/register">Register here</Link>
            </div>
        </div>
    );
}
