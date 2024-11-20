import React from 'react';
import classes from "./OrdersListPage.module.css";
import {useNavigate} from "react-router-dom";

export default function OrdersListPage() {
    const navigate = useNavigate();


    const handleNavigate = (path) => {
        navigate(path);
    };

    return (
        <div className={classes.OrdersListPage}>
            <div className={classes.Options}>
                <button type="Option"
                        className={classes.OptionButton}
                        onClick={() => handleNavigate('/profile')}
                >
                    Contact information
                </button>
                <button type="Option"
                        className={classes.OptionButtonSelected}
                        onClick={() => handleNavigate('/ordersList')}
                >
                    Orders
                </button>
                <button type="Option"
                        className={classes.OptionButton}
                        onClick={() => handleNavigate('/offersList')}
                >
                    Offers
                </button>
            </div>

            <div className={classes.Orders}>
                <p>Orders</p>
            </div>
        </div>
    )
}