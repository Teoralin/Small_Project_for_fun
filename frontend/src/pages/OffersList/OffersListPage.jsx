import React from 'react';
import { useState, useEffect } from 'react';
import classes from './OffersListPage.module.css';
import {useNavigate} from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

export default function OffersListPage() {
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState(null);
    const [userOffers, setUserOffers] = useState([]);
    const [farmer, setFarmer] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('User is not logged in');
                    setLoading(false);
                    return;
                }

                const decodedToken = jwtDecode(token);
                const userId = decodedToken.userId; 

                // Fetch offers from the backend
                const response = await axios.get(`http://localhost:3000/offers/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setUserOffers(response.data); 
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Error fetching offers');
                setLoading(false);
            }
        };

        fetchOffers();
    }, []);

    const updateQuantity = async (offerId, newQuantity) => {
        if (newQuantity < 0) {
            setError('Quantity cannot be negative.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `http://localhost:3000/offers/${offerId}`,
                { quantity: newQuantity },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Update the local state after a successful API call
            setUserOffers((prevOffers) =>
                prevOffers.map((offer) =>
                    offer.offer_id === offerId
                        ? { ...offer, quantity: newQuantity }
                        : offer
                )
            );
        } catch (err) {
            console.error('Error updating quantity:', err);
            setError('Failed to update quantity. Please try again.');
        }
    };

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
                <p>Your Offers</p>
                {loading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p className={classes.Error}>{error}</p>
                ) : userOffers.length === 0 ? (
                    <p>You have no offers yet.</p>
                ) : (
                    <div className={classes.OfferList}>
                        {userOffers.map((offer) => (
                            <div key={offer.offer_id} className={classes.OfferCard}>
                                <h3>{offer.Product.name}</h3>
                                <p>{offer.Product.description}</p>
                                <p>Price: ${offer.price}</p>
                                <p>Quantity: {offer.quantity}</p>
                                <p>Status: {offer.status}</p>
                                {offer.is_pickable && <p>Pickable: Yes</p>}
                                
                                <div className={classes.QuantityUpdate}>
                                    <label htmlFor={`quantity-${offer.offer_id}`}>Quantity:</label>
                                    <input
                                        type="number"
                                        id={`quantity-${offer.offer_id}`}
                                        value={offer.quantity}
                                        min="0"
                                        onChange={(e) =>
                                            setUserOffers((prevOffers) =>
                                                prevOffers.map((o) =>
                                                    o.offer_id === offer.offer_id
                                                        ? { ...o, quantity: e.target.value }
                                                        : o
                                                )
                                            )
                                        }
                                    />
                                    <button
                                        onClick={() =>
                                            updateQuantity(
                                                offer.offer_id,
                                                parseInt(offer.quantity, 10)
                                            )
                                        }
                                    >
                                        Update
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}