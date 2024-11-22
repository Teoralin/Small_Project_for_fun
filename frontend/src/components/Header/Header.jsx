import { useEffect, useState } from "react";
import classes from "./Header.module.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import axios from "axios";
import userIcon from "../../assets/User.png";
import cartIcon from "../../assets/Сart.png";
import leftIcon from "../../assets/Left.png";

export default function Header() {
    const [userName, setUserName] = useState(null);
    const navigate = useNavigate();
    const location = useLocation(); // Get the current URL

    // Check if the user is logged in and fetch their name
    useEffect(() => {
        const fetchUserName = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                setUserName(null); // User is not logged in
                return;
            }

            try {
                const decodedToken = jwtDecode(token);
                const userId = decodedToken.userId;

                const response = await axios.get(`http://localhost:3000/users/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setUserName(response.data.name); // Set the user's name
            } catch (err) {
                console.error("Error fetching user data:", err);
                setUserName(null);
            }
        };

        fetchUserName();
    }, []);

    // Logout logic
    const logout = () => {
        localStorage.removeItem("token"); // Remove token from localStorage
        setUserName(null); // Reset userName state
        navigate("/login"); // Redirect to the login page
    };

    const cart = {
        totalCount: 10, // Placeholder for cart items
    };

    return (
        <header className={classes.header}>
            <div className={classes.container}>
                <div className={classes.logoContainer}>
                    <img
                        src={leftIcon}
                        alt="Left Icon"
                        className={classes.icon}
                        onClick={() => window.history.back()}
                        style={{ cursor: "pointer" }}
                    />
                    <Link to="/" className={classes.logo}>
                        YellowShop
                    </Link>
                </div>

                <nav>
                    <ul>
                        {userName ? (
                            <li className={classes.menu_container}>
                                <Link to="/profile" className={classes.user_link}>
                                    <img
                                        src={userIcon}
                                        alt="User Icon"
                                        className={classes.icon}
                                    />
                                    {userName}
                                </Link>
                                <div className={classes.menu}>
                                    <Link to="/profile">Profile</Link>
                                    <Link to="/ordersList">Orders</Link>
                                    <a onClick={logout} style={{ cursor: "pointer" }}>
                                        Logout
                                    </a>
                                </div>
                            </li>
                        ) : (
                            <li>
                                <Link to="/login">Log in</Link>
                            </li>
                        )}

                        <li>
                            <Link to="/cart" className={classes.cart_link}>
                                <img
                                    src={cartIcon}
                                    alt="Cart Icon"
                                    className={classes.icon}
                                />
                                {cart.totalCount > 0 && <span>{cart.totalCount}</span>}
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}
