import { useState, useEffect } from "react";
import classes from "./HomePage.module.css";
import time from "../../assets/time-eat.png";
import delivery from "../../assets/delivery.png";
import paris from "../../assets/paris.png";
import food from "../../assets/Plate.png";
import insta_1 from "../../assets/Insta_1.png";
import insta_2 from "../../assets/Insta_2.png";
import insta_3 from "../../assets/Insta_3.png";
import insta_4 from "../../assets/Insta_4.png";
import insta_5 from "../../assets/Insta_5.png";
import {useNavigate} from "react-router-dom";
import {jwtDecode} from 'jwt-decode';
import api from "../../api";

export default function HomePage() {
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [error, setError] = useState(null);
    const [scrollPosition, setScrollPosition] = useState(0);

    const navigate = useNavigate();


    const handleNavigate = (path) => {
        navigate(path);
    };

    const handleFarmerClick = (farmerId) => {
        navigate(`/farmer/${farmerId}`);
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setUserRole(decodedToken.role); 
            } catch (error) {
                console.error("Invalid token:", error);
                localStorage.removeItem("token");
            }
        }
    }, []);


    useEffect(() => {
        async function fetchUsers() {
            try {
                setLoading(true);
                const response = await api.get('/users');  
                const farmerUsers = response.data.filter(user => user.is_farmer === true);

                setFilteredUsers(farmerUsers);
            } catch (error) {
                console.error('Error fetching users:', error);
                setError('An error occurred while fetching users');
            } finally {
                setLoading(false);
            }
        }

        fetchUsers();
    }, []);

    const handleScrollLeft = () => {
        setScrollPosition(scrollPosition - 300);
    };

    const handleScrollRight = () => {
        setScrollPosition(scrollPosition + 300);
    };

    if(loading){
        return <div>Loading...</div>;
    }
    if(error){
        return <div>{error}</div>;
    }

    return (
        <div className={classes.HomePage}>
                <div className={classes.welcomescreen}>
                    <div className={classes.heading}>Your Food court at home</div>
                    <div className={classes.information}>
                        <div className={classes.info} onClick={() => handleNavigate('/categories')}>
                            <h2>Categories</h2>
                            <p>Order in</p>
                        </div>
                        <div className={classes.info} onClick={() => handleNavigate('/harvestList')}>
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
                                &#8592;
                            </button>
                            <ul
                                className={classes.UserComponent}
                                style={{transform: `translateX(-${scrollPosition}px)`}}
                            >
                                {filteredUsers.map((user) => (
                                    <li key={user.user_id} className={classes.userCompo}>
                                        <div className={classes.UserInfo} onClick={() => handleFarmerClick(user.user_id)}>
                                            {user.name} <br/>
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
                                &#8594;
                            </button>
                        </div>
                    )}
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
            </div>

    );
}
