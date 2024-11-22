import { Link, useNavigate } from "react-router-dom";
import classes from "./Header.module.css";
import userIcon from "../../assets/User.png";
import cartIcon from "../../assets/Сart.png";
import leftIcon from "../../assets/Left.png";
import { useUserContext } from "../../context/userContext"; // Import the custom hook

export default function Header() {
    const { userName, logout } = useUserContext(); // Get userName and logout from the UserContext
    const navigate = useNavigate();

    const cart = {
        totalCount: 10, // Placeholder for cart items
    };

    console.log(userName);
    // Logout logic
    const handleLogout = () => {
        logout(); // Calls logout from the context to reset userName and remove token
        navigate("/login"); // Redirects the user to the login page
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
                                    <a onClick={handleLogout} style={{ cursor: "pointer" }}>
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
                                {cart.totalCount > 0 && <span>{cart.totalCount}</span>}
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}
