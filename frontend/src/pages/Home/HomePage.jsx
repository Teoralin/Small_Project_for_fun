import React from "react";
import classes from "../Home/HomePage.module.css";
import userIcon from "../../assets/User.png";
import time from "../../assets/time-eat.png";
import delivery from "../../assets/delivery.png";
import paris from "../../assets/paris.png";
import food from "../../assets/Photo.png";
import {Link} from "react-router-dom";
import hand from "../../assets/ph_hand-coins-thin.png";

export default function HomePage() {
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
                            alt="Pelivery Icon"
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
                    className={ classes.foodIcon}
                />

            </div>

            <div className={classes.farmers}>
                <div className={classes.compo}>
                    <p>Farmers</p>
                    <button type="show" className={classes.ShowAllButton}>
                        show all
                    </button>
                </div>
            </div>

            <div className={classes.Self_Harvest}>
                <div>
                    <div className={classes.title}>
                        <p>Self Harvest</p>
                        <img
                            src={hand}
                            alt="hand Icon"
                            className={classes.icon}
                        />
                    </div>

                    <p className={classes.HarvestText}>Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Mauris elementum mauris vitae tortor.</p>

                    <button type="show" className={classes.ShowAllButton}>
                        show all
                    </button>
                </div>
            </div>


            <div><Link to="/users">Users</Link></div>
        </div>
    );
}