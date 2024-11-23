import React from 'react';
import { useState, useEffect } from 'react';
import classes from './OffersListPage.module.css';
import {useNavigate} from "react-router-dom";
import { jwtDecode } from 'jwt-decode';

export default function OffersListPage() {
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState(null);
    const [farmer, setFarmer] = useState('');
    const [error, setError] = useState('');

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

                {farmer === "farmer" && (
                <button type="Option"
                        className={classes.OptionButton}
                        onClick={() => handleNavigate('/offersList')}
                >
                    Offers
                </button>
                 )}
                {userRole === "Administrator" && (
                <button type="Option"
                        className={classes.OptionButton}
                        onClick={() => handleNavigate('/editUsersList')}
                >
                    Manage Users
                </button>
                )}
                {userRole === "Moderator" && (
                    <button type="Option"
                            className={classes.OptionButton}
                            onClick={() => handleNavigate('/categories')}
                    >
                        Manage Categories
                    </button>
                )}
            </div>

            <div className={classes.Offers}>
                <p>Offers</p>
            </div>
        </div>
    )
}