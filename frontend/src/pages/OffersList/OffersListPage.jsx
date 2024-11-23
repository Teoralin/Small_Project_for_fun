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
                const response = await axios.get(`http://localhost:3000/offers/user/${userId}`, {
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

    const updatePrice = async (offerId, newPrice) => {
        if (newPrice < 0) {
            setError('Price cannot be negative.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `http://localhost:3000/offers/${offerId}`,
                { price: newPrice },
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
                        ? { ...offer, price: newPrice }
                        : offer
                )
            );
        } catch (err) {
            console.error('Error updating Price:', err);
            setError('Failed to update Price. Please try again.');
        }
    };

    const handleDeleteHarvest = async (harvestEventId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:3000/harvests/${harvestEventId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setUserOffers((prevOffers) =>
                prevOffers.map((offer) => {
                    if (offer.selfHarvestEvents) {
                        offer.selfHarvestEvents = offer.selfHarvestEvents.filter(
                            (event) => event.event_id !== harvestEventId
                        );
                    }
                    return offer;
                })
            );

            setError('');
        } catch (err) {
            setError('Failed to delete self-harvest event');
        }
    };

    const handleNavigate = (path) => {
        navigate(path);
    };

    const handleAddHarvest = (offer) => {
        navigate('/editHarvest', { state: { offerId: offer.offer_id, userId: offer.user_id } });
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
                                
                                <div className={classes.Update}>
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
                                <div className={classes.Update}>
                                    <label htmlFor={`price-${offer.offer_id}`}>Price:</label>
                                    <input
                                        type="number"
                                        id={`price-${offer.offer_id}`}
                                        value={offer.price}
                                        min="0"
                                        onChange={(e) =>
                                            setUserOffers((prevOffers) =>
                                                prevOffers.map((o) =>
                                                    o.offer_id === offer.offer_id
                                                        ? { ...o, price: e.target.value }
                                                        : o
                                                )
                                            )
                                        }
                                    />
                                    <button
                                        onClick={() =>
                                            updatePrice(
                                                offer.offer_id,
                                                parseInt(offer.price, 10)
                                            )
                                        }
                                    >
                                        Update
                                    </button>
                                </div>
                                {/* List of self-harvest events */}
                                <div className={classes.SelfHarvestEvents}>
                                    <h4>Self-Harvest Events</h4>
                                    {offer.selfHarvestEvents && offer.selfHarvestEvents.length > 0 ? (
                                        <div className={classes.SelfHarvestList}>
                                            {offer.selfHarvestEvents.map((event) => (
                                                <div key={event.event_id} className={classes.SelfHarvestCard}>
                                                    <p>Harvest Date: {event.date}</p>
                                                    <p>Quantity: {event.quantity}</p>
                                                    <div className={classes.SelfHarvestActions}>
                                                        <button
                                                            onClick={() => handleAddHarvest(event)} //TODO edit 
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteHarvest(event.event_id)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p>No self-harvest events yet.</p>
                                    )}
                                </div> 
                                <div className={classes.AddSelfHarvest}>
                                    <button
                                        onClick={() => handleAddHarvest(offer)}
                                    >
                                        Add self harvest
                                    </button>
                                </div>
                            </div>
                        ))}
                        <div className={classes.AddSelfHarvest}>
                            <button
                                onClick={() => handleNavigate('/categories')}
                            >
                                Add new offer
                            </button>
                        </div>
                    </div>
                )}
            </div>
             
        </div>
    )
}