import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../../api";
import classes from "./Header.module.css";
import userIcon from "../../assets/User.png";
import cartIcon from "../../assets/Сart.png";
import leftIcon from "../../assets/Left.png";

export default function Header() {
    const [userName, setUserName] = useState(null);
    const [cartCount, setCartCount] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();
    const [userRole, setUserRole] = useState(null);
    const [farmer, setFarmer] = useState('');
    const [error, setError] = useState('');

    const fetchUserName = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            setUserName(null);
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

            setUserName(response.data.name);
        } catch (err) {
            console.error("Error fetching user data:", err);
            setUserName(null);
        }
    };

    useEffect(() => {
        const getRole = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('User is not logged in');
                    return;
                }

                const decodedToken = jwtDecode(token);
                if(decodedToken.is_farmer){
                    setFarmer('farmer');
                }
                setUserRole(decodedToken.role);



            } catch (err) {
                setError(err.response?.data?.message || 'Error fetching user data');
            }
        };

        getRole();
    }, []);

    const fetchCartCount = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            setCartCount(0);
            return;
        }

        try {
            const response = await api.get("/cart", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setCartCount(response.data.length);
        } catch (err) {
            console.error("Error fetching cart data:", err);
            setCartCount(0);
        }
    };

    useEffect(() => {
        fetchUserName();
        fetchCartCount();
    }, [location]);

    // Logout logic
    const logout = () => {
        localStorage.removeItem("token");
        setUserName(null);
        setCartCount(0);
        navigate("/login");
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
                                    <Link to="/profile" className={classes.OptionButton}>
                                        Profile
                                    </Link>

                                    <Link to="/ordersList" className={classes.OptionButton}>
                                        Orders
                                    </Link>

                                    <Link to="/review" className={classes.OptionButton}>
                                        Reviews
                                    </Link>

                                    {farmer === "farmer" && (
                                        <Link to="/offersList" className={classes.OptionButton}>
                                            Offers
                                        </Link>
                                    )}

                                    {userRole === "Administrator" && (
                                        <Link to="/editUsersList" className={classes.OptionButton}>
                                            Manage Users
                                        </Link>
                                    )}

                                    {userRole === "Moderator" || userRole === "Administrator" && (
                                        <Link to="/categories" className={classes.OptionButton}>
                                            Manage Categories
                                        </Link>
                                    )}

                                    <a onClick={logout} style={{cursor: "pointer"}} className={classes.OptionButton}>
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