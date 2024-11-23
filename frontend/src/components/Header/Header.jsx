import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"; // Import useLocation
import { jwtDecode } from "jwt-decode";
import api from "../../api";
import classes from "./Header.module.css";
import userIcon from "../../assets/User.png";
import cartIcon from "../../assets/Сart.png";
import leftIcon from "../../assets/Left.png";

export default function Header() {
    const [userName, setUserName] = useState(null);
    const [cartCount, setCartCount] = useState(0); // Number of items in the cart
    const navigate = useNavigate();
    const location = useLocation(); // Detect route changes

    // Check if the user is logged in and fetch their name
    const fetchUserName = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            setUserName(null); // User is not logged in
            return;
        }

        try {
            const decodedToken = jwtDecode(token);
            const userId = decodedToken.userId;

            const response = await api.get(`/users/${userId}`, {
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

    // Fetch the cart count
    const fetchCartCount = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            setCartCount(0); // Reset cart count if the user is not logged in
            return;
        }

        try {
            const response = await api.get("/cart", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setCartCount(response.data.length); // Set cart count based on the number of items
        } catch (err) {
            console.error("Error fetching cart data:", err);
            setCartCount(0);
        }
    };

    // Use useEffect to trigger updates when the location changes
    useEffect(() => {
        fetchUserName();
        fetchCartCount();
    }, [location]); // Re-run on route change

    // Logout logic
    const logout = () => {
        localStorage.removeItem("token"); // Remove token from localStorage
        setUserName(null); // Reset userName state
        setCartCount(0); // Reset cart count
        navigate("/login"); // Redirect to the login page
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
                                {cartCount >= 0 && <span>{cartCount}</span>}
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}