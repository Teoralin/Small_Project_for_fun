import React, { useState, useEffect } from "react";
import classes from "./HomePage.module.css";
import userIcon from "../../assets/User.png";
import time from "../../assets/time-eat.png";
import delivery from "../../assets/delivery.png";
import paris from "../../assets/paris.png";
import food from "../../assets/Plate.png";
import insta_1 from "../../assets/insta_1.png";
import insta_2 from "../../assets/insta_2.png";
import insta_3 from "../../assets/Insta_3.png";
import insta_4 from "../../assets/Insta_4.png";
import insta_5 from "../../assets/Insta_5.png";
import {Link, useNavigate} from "react-router-dom";
import hand from "../../assets/Harvest_icon.png";
import {jwtDecode} from 'jwt-decode';
import axios from 'axios';

export default function HomePage() {
    const [userRole, setUserRole] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [scrollPosition, setScrollPosition] = useState(0);

    const navigate = useNavigate();


    const handleNavigate = (path) => {
        navigate(path);
    };

    // Decode token and check the user's role
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setUserRole(decodedToken.role); 
            } catch (error) {
                console.error("Invalid token:", error);
                localStorage.removeItem("token"); // Remove invalid token
            }
        }
    }, []);

    const handleSearchChange = (event) => {
        const term = event.target.value.toLowerCase();
        setSearchTerm(term);

        const filtered = users.filter((user) =>
            user.name.toLowerCase().includes(term) ||
            user.surname.toLowerCase().includes(term)
        );
        setFilteredUsers(filtered);
    };

    useEffect(() => {
        // Fetch users from the API using axios
        async function fetchUsers() {
            try {
                const response = await axios.get('http://localhost:3000/users'); // Adjust the API URL

                // Filter users who have 'is_farmer' set to true
                const farmerUsers = response.data.filter(user => user.is_farmer === true);

                setUsers(farmerUsers); // Set filtered users
                setFilteredUsers(farmerUsers); // Initialize filteredUsers
            } catch (error) {
                console.error('Error fetching users:', error);
                setError('An error occurred while fetching users'); // Set error state
            } finally {
                setLoading(false); // Set loading to false once the request is complete
            }
        }

        fetchUsers();
    }, []); // Empty dependency array to run the effect once on mount

    const handleScrollLeft = () => {
        setScrollPosition(scrollPosition - 300); // Прокручиваем влево
    };

    const handleScrollRight = () => {
        setScrollPosition(scrollPosition + 300); // Прокручиваем вправо
    };

    return (
        <div className={classes.HomePage}>
            <div className={classes.welcomescreen}>
                <div className={classes.heading}>Your Food court at home</div>
                <div className={classes.information}>
                    <div className={classes.info}>
                        <h2>Delivery</h2>
                        <p>Order in</p>
                    </div>
                    <div className={classes.info}>
                        <h2>Self harvest</h2>
                        <p>Grab and go</p>
                    </div>
                </div>

                <div className={classes.benefits}>
                    <div className={classes.benefitItem}>
                        <img
                            src={time}
                            alt="Time Icon"
                            className={classes.icon}
                        />
                        <p>Fast delivery in less than 42 hours</p>
                    </div>
                    <div className={classes.benefitItem}>
                        <img
                            src={delivery}
                            alt="Delivery Icon"
                            className={classes.icon}
                        />
                        <p>Free delivery from 999 CZK</p>
                    </div>
                    <div className={classes.benefitItem}>
                        <img
                            src={paris}
                            alt="Paris Icon"
                            className={classes.icon}
                        />
                        <p>Only fresh and Czech products</p>
                    </div>
                </div>

                <img
                    src={food}
                    alt="Food Photo"
                    className={`${classes.icon} ${classes.foodIcon}`}
                />
            </div>

            <div className={classes.farmers}>
                <div className={classes.compo}>
                    <p>Farmers</p>
                    <button
                        type="button"
                        className={classes.ShowAllButton}
                        onClick={() => handleNavigate('/farmers')}
                    >
                        Show all
                    </button>
                </div>

                {filteredUsers.length === 0 ? (
                    <p>No users found.</p>
                ) : (
                    <div className={classes.scrollContainer}>
                        <button
                            onClick={handleScrollLeft}
                            className={classes.scrollButton}
                            disabled={scrollPosition <= 0}
                        >
                            &#8592; {/* Стрелка влево */}
                        </button>
                        <ul
                            className={classes.UserComponent}
                            style={{ transform: `translateX(-${scrollPosition}px)` }}
                        >
                            {filteredUsers.map((user) => (
                                <li key={user.id} className={classes.userCompo}>
                                    <div>
                                        <img
                                            src="https://via.placeholder.com/296x184"
                                            alt="User Avatar"
                                        />
                                    </div>

                                    <div className={classes.UserInfo}>
                                        {user.name} <br />
                                        {user.surname}
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={handleScrollRight}
                            className={classes.scrollButton}
                            disabled={scrollPosition >= (filteredUsers.length - 5) * 300}
                        >
                            &#8594; {/* Стрелка вправо */}
                        </button>
                    </div>
                )}
            </div>

            <div className={classes.Self_Harvest}>
                <div className={classes.Harvest_compo}>
                    <div className={classes.title}>
                        <p>Self Harvest</p>
                        <img
                            src={hand}
                            alt="hand Icon"
                            className={classes.icon}
                        />
                    </div>

                    <p className={classes.HarvestText}>
                        Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Mauris elementum mauris vitae tortor.
                    </p>

                    <button type="show"
                            className={classes.ShowAllButton}
                            onClick={() => handleNavigate('/harvestList')}
                    >
                        show all
                    </button>
                </div>
            </div>

            <div className={classes.categories}>
                <div className={classes.compo}>
                    <p>Categories</p>
                    <button type="show"
                            className={classes.ShowAllButton}
                            onClick={() => handleNavigate('/categories')}
                    >
                        show all
                    </button>
                </div>
            </div>

            <div className={classes.instagram}>
                <div className={classes.instagram_text}>
                    <p>#YellowShop </p>
                    <p> on instagram</p>
                </div>
                <div className={classes.instagram_img}>
                    <img
                        src={insta_1}
                        alt="insta"
                        className={classes.icon}
                    />
                    <img
                        src={insta_2}
                        alt="insta"
                        className={classes.icon}
                    />
                    <img
                        src={insta_3}
                        alt="insta"
                        className={classes.icon}
                    />
                    <img
                        src={insta_4}
                        alt="insta"
                        className={classes.icon}
                    />
                    <img
                        src={insta_5}
                        alt="insta"
                        className={classes.icon}
                    />
                </div>
            </div>

            {/* Only render this link if the user is an Administrator */}
            {userRole === "Administrator" && (
                <div>
                <Link to="/users">Users</Link>
                </div>
            )}
        </div>
    );
}
