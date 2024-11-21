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

export default function HomePage() {
    const [userRole, setUserRole] = useState(null);

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
                setUserRole(decodedToken.role); // Set the user's role from the token
            } catch (error) {
                console.error("Invalid token:", error);
                localStorage.removeItem("token"); // Remove invalid token
            }
        }
    }, []);

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
