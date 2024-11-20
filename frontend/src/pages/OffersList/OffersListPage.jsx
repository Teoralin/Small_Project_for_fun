import React from 'react';
import classes from './OffersListPage.module.css';
import {useNavigate} from "react-router-dom";

export default function OffersListPage() {
    const navigate = useNavigate();


    const handleNavigate = (path) => {
        navigate(path);
    };

    return (
        <div className={classes.OffersListPage}>
            <div className={classes.Options}>
                <button type="Option"
                        className={classes.OptionButton}
                        onClick={() => handleNavigate('/profile')}
                >
                    Contact information
                </button>
                <button type="Option"
                        className={classes.OptionButton}
                        onClick={() => handleNavigate('/ordersList')}
                >
                    Orders
                </button>
                <button type="Option"
                        className={classes.OptionButtonSelected}
                        onClick={() => handleNavigate('/offersList')}
                >
                    Offers
                </button>
            </div>

            <div className={classes.Offers}>
                <p>Offers</p>
            </div>
        </div>
    )
}