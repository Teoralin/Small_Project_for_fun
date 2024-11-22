import { Link, useNavigate } from "react-router-dom";
import classes from "./Header.module.css";
import {jwtDecode} from "jwt-decode";
import axios from "axios";
import userIcon from "../../assets/User.png";
import cartIcon from "../../assets/Сart.png";
import leftIcon from "../../assets/Left.png";
import { useUserContext } from "../../context/userContext";
import { useState, useEffect } from "react";

export default function Header() {
    const { userName, setUserName } = useUserContext(); // Get userName and logout from the UserContext
    const [cartCount, setCartCount] = useState(0); // Number of items in the cart
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCartCount = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setCartCount(0); // Reset cart count if user is not logged in
                return;
            }
    
            try {
                const response = await axios.get("http://localhost:3000/cart", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setCartCount(response.data.length); // Update cart count
            } catch (err) {
                console.error("Error fetching cart data:", err);
                setCartCount(0); // Handle errors by resetting cart count
            }
        };
    
        fetchCartCount(); // Fetch cart count initially
    
        const interval = setInterval(() => {
            fetchCartCount(); // Periodically fetch cart count
        }, 5000); // Fetch every 5 seconds
    
        return () => clearInterval(interval); // Cleanup interval on component unmount
    }, []);

    // Logout logic
    const logout = () => {
        localStorage.removeItem("token"); 
        setUserName(null); 
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
                            // If user is logged in, show user name and logout option
                            <li className={classes.menu_container}>
                                <Link to="/profile" className={classes.user_link}>
                                    <img
                                        src={userIcon}
                                        alt="User Icon"
                                        className={classes.icon}
                                    />
                                    {userName} {/* Display the logged-in user's name */}
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
                            // If user is not logged in, show "Log in" link
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
