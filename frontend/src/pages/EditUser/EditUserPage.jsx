import React from 'react';
import {useNavigate} from "react-router-dom";
import classes from "../EditUsersList/EditUserListPage.module.css";

export default function EditUserPage() {
    const navigate = useNavigate();


    const handleNavigate = (path) => {
        navigate(path);
    };

    return (
        <div className={classes.EditUserPage}>
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
                        className={classes.OptionButton}
                        onClick={() => handleNavigate('/offersList')}
                >
                    Offers
                </button>
                <button type="Option"
                        className={classes.OptionButtonSelected}
                        onClick={() => handleNavigate('/editUsersList')}
                >
                    Manage Users
                </button>
            </div>


        </div>
    )
}