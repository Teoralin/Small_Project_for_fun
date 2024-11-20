import React from 'react';
import classes from "../Profile/ProfilePage.module.css";
import { Link, useNavigate } from 'react-router-dom';

export default function ProfilePage() {
    return (
        <div className={classes.ProfilePage}>
            <div className={classes.Options}>
                <button type="Option" className={classes.OptionButtonSelected}>
                    Contact information
                </button>
                <button type="Option" className={classes.OptionButton}>
                    Orders
                </button>
                <button type="Option" className={classes.OptionButton}>
                    Offers
                </button>
            </div>

        </div>
    )
}