import React from "react";
import classes from "./Header.module.css";
import { Link } from "react-router-dom";
import userIcon from "../../assets/User.png";
import cartIcon from "../../assets/Сart.png";
import leftIcon from "../../assets/left.png";

export default function Header() {
    const user = {
        name: 'John',
    };

    const cart = {
        totalCount: 10,
    };

    const logout = () => {};

    return (
        <header className={classes.header}>
            <div className={classes.container}>
                <div className={classes.logoContainer}>
                    <img
                        src={leftIcon}
                        alt="Left Icon"
                        className={classes.icon}
                    />
                    <Link to="/" className={classes.logo}>
                        YellowShop
                    </Link>
                </div>


                <nav>
                    <ul>
                        {user ? (
                            <li className={classes.menu_container}>
                                <Link to="/dashboard" className={classes.user_link}>
                                    <img
                                        src={userIcon}
                                        alt="User Icon"
                                        className={classes.icon}
                                    />
                                    {user.name}
                                </Link>
                                <div className={classes.menu}>
                                    <Link to="/profile">Profile</Link>
                                    <Link to="/orders">Orders</Link>
                                    <a onClick={logout}>Logout</a>
                                </div>
                            </li>
                        ) : (
                            <Link to="/login">Login</Link>
                        )}

                        <li>
                            <Link to="/cart" className={classes.cart_link}>
                                <img
                                    src={cartIcon}
                                    alt="Cart Icon"
                                    className={classes.icon}
                                />
                                {cart.totalCount > 0 && (
                                    <span className={classes.cart_count}>{cart.totalCount}</span>
                                )}
                            </Link>
                        </li>

                        <li>
                            <Link to="/login">login</Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}
