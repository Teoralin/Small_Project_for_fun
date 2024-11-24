import { useState, useEffect } from 'react';
import classes from './OffersListPage.module.css';
import {useNavigate} from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import api from '../../api';

export default function OffersListPage() {
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState(null);
    const [userOffers, setUserOffers] = useState([]);
    const [farmer, setFarmer] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [success, setSuccess] = useState('');
    const [newHarvest, setNewHarvest] = useState({
        offer_id: 0,
        address_id: 0,
        start_date: '',
        end_date: '',
    });
    const [editHarvest, setEditHarvest] = useState(null); 


    const handleAddHarvest = async (offer) => {
        try {
  
            const token = localStorage.getItem('token');
            const userId = offer.user_id;  
            const response = await api.get(`/addresses/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
    
            const addressId = response.data?.address_id;
            if (!addressId) {
                setError('Address not found for this user.');
                return;
            }
    
            setModalOpen(true);
    
            setNewHarvest({
                offer_id: offer.offer_id, 
                address_id: addressId, 
                start_date: '',
                end_date: '',
            });
    
            setError('');
        } catch (err) {
            console.error('Error fetching address:', err);
            setError('Failed to retrieve address. Please try again.');
        }
    };

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
                const response = await api.get(`/offers/user/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                
                const offersWithHarvests = await Promise.all(response.data.map(async (offer) => {
                    if (offer.is_pickable) {
                        const selfHarvestEvents = await fetchSelfHarvestEvents(offer.offer_id);
                        return { ...offer, selfHarvestEvents };  
                    } else {
                        return { ...offer, selfHarvestEvents: [] };
                    }
                }));

                setUserOffers(offersWithHarvests);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Error fetching offers');
                setLoading(false);
            }
        };

        fetchOffers();
    }, []);


    const fetchSelfHarvestEvents = async (offerId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await api.get(`/harvests/offer/${offerId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const today = new Date();
            const filteredEvents = response.data.filter(event => {
                const eventEndDate = new Date(event.end_date);
                return eventEndDate >= today; 
                });
    
                return filteredEvents;  
        } catch (err) {
            console.error('Error fetching self-harvest events:', err);
            setError('Failed to fetch self-harvest events');
            return [];
        }
    };
  
    const handleSubmit = async (e) => {
        e.preventDefault();
            if (!newHarvest.start_date || !newHarvest.end_date) {
            setError('Please fill all required fields.');
            return;
        }
    
        try {
            const token = localStorage.getItem('token');
            await api.post(
                '/harvests',
                {
                    start_date: newHarvest.start_date,
                    end_date: newHarvest.end_date,
                    quantity: newHarvest.quantity,
                    address_id: newHarvest.address_id,
                    offer_id: newHarvest.offer_id,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
    
            setSuccess('Self-harvest event created successfully!');
            setError('');
    
        const updatedSelfHarvestEvents = await fetchSelfHarvestEvents(newHarvest.offer_id);

        setUserOffers((prevOffers) =>
            prevOffers.map((offer) =>
                offer.offer_id === newHarvest.offer_id
                    ? {
                          ...offer,
                          selfHarvestEvents: updatedSelfHarvestEvents,
                      }
                    : offer
            )
        );
    
            handleCloseModal();
        } catch (err) {
            console.error('Error creating self-harvest event:', err);
            setError('Failed to create self-harvest event. Please try again.');
        }
    };
    
    const handleCloseModal = () => {
        setModalOpen(false);
        setEditHarvest(null);
        setNewHarvest({
            offer_id: '',
            address_id: '',
            start_date: '',
            end_date: '',
            quantity: '',
        });
        setError('');
        setSuccess('');
    };
    
    const updateQuantity = async (offerId, newQuantity) => {
        if (newQuantity < 0) {
            setError('Quantity cannot be negative.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await api.put(
                `/offers/${offerId}`,
                { quantity: newQuantity },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

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
            await api.put(
                `/offers/${offerId}`,
                { price: newPrice },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

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
            await api.delete(`/harvests/${harvestEventId}`, {
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
            setError('Failed to delete self-harvest event: ', err);
        }
    };

    const editSelfHarvest = (event) => {
        setEditHarvest(event);  
        setModalOpen(true);    
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
    
        if (!editHarvest.start_date || !editHarvest.end_date) {
            setError('Please fill all required fields.');
            return;
        }
    
        try {
            const token = localStorage.getItem('token');
            await api.put(
                `/harvests/${editHarvest.event_id}`,
                {
                    start_date: editHarvest.start_date,
                    end_date: editHarvest.end_date,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
    
            const updatedSelfHarvestEvents = await fetchSelfHarvestEvents(editHarvest.offer_id);
    
            setUserOffers((prevOffers) =>
                prevOffers.map((offer) =>
                    offer.offer_id === editHarvest.offer_id
                        ? {
                              ...offer,
                              selfHarvestEvents: updatedSelfHarvestEvents,
                          }
                        : offer
                )
            );
    
            setSuccess('Self-harvest event updated successfully!');
            setError('');
            handleCloseModal();
        } catch (err) {
            console.error('Error updating self-harvest event:', err);
            setError('Failed to update self-harvest event. Please try again.');
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
                <button type="Option"
                        className={classes.OptionButton}
                        onClick={() => handleNavigate('/review')}
                >
                    Reviews
                </button>

                {farmer === "farmer" && (
                    <button type="Option"
                            className={classes.OptionButtonSelected}
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
                {userRole === "Moderator" || userRole === "Administrator" && (
                    <button type="Option"
                            className={classes.OptionButton}
                            onClick={() => handleNavigate('/categories')}
                    >
                        Manage Categories
                    </button>
                )}
            </div>

            <div className={classes.Offers}>
                <p className={classes.PageTitle}>Offers</p>

                <div className={classes.NewOffer}>
                    <button
                        onClick={() => handleNavigate('/categories')}
                        className={classes.AddSelfHarvest}
                    >
                        Add new offer
                    </button>
                </div>
                <div className={classes.separator}></div>

                {loading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p className={classes.Error}>{error}</p>
                ) : userOffers.length === 0 ? (
                    <p>You have no offers yet.</p>
                ) : (
                    <div className={classes.OfferList}>
                        {userOffers.map((offer) => (
                            <div key={offer.offer_id} className={classes.OfferWrapper}>
                                <div className={classes.OfferCard}>
                                    <p className={classes.ProductName}>{offer.Product.name}</p>
                                    <p>{offer.Product.description}</p>
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
                                                            ? {...o, quantity: e.target.value}
                                                            : o
                                                    )
                                                )
                                            }
                                        />
                                        <button
                                            onClick={() =>
                                                updateQuantity(offer.offer_id, parseInt(offer.quantity, 10))
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
                                                            ? {...o, price: e.target.value}
                                                            : o
                                                    )
                                                )
                                            }
                                        />
                                        <button
                                            onClick={() =>
                                                updatePrice(offer.offer_id, parseInt(offer.price, 10))
                                            }
                                        >
                                            Update
                                        </button>
                                    </div>

                                    <div className={classes.SelfHarvestEvents}>
                                        <h4>Self-Harvest Events</h4>
                                        {offer.selfHarvestEvents && offer.selfHarvestEvents.length > 0 ? (
                                            <div className={classes.SelfHarvestList}>
                                                {offer.selfHarvestEvents.map((event) => (
                                                    <div key={event.event_id} className={classes.SelfHarvestCard}>
                                                        <p>Harvest start date: {event.start_date}</p>
                                                        <p>Harvest end date: {event.end_date}</p>
                                                        {event.Address && (
                                                            <div className={classes.EventAddress}>
                                                                <h5>Event Address</h5>
                                                                <p>city: {event.Address.city},
                                                                    postcode: {event.Address.post_code}</p>
                                                                <p>street: {event.Address.street},
                                                                    house: {event.Address.house_number}</p>
                                                            </div>
                                                        )}
                                                        <div className={classes.SelfHarvestActions}>
                                                            <button
                                                                onClick={() => editSelfHarvest(event)}
                                                                className={classes.ApproveButton}
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteHarvest(event.event_id)}
                                                                className={classes.DisapproveButton}
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
                                    <div>
                                        <button
                                            onClick={() => handleAddHarvest(offer)}
                                            className={classes.AddSelfHarvest}
                                        >
                                            Add self harvest
                                        </button>
                                    </div>
                                </div>

                                <div className={classes.separator}></div>
                            </div>
                        ))}
                    </div>
                )}
            </div>


            {modalOpen && (
                <div className={classes.ModalOverlay}>
                    <div className={classes.Modal}>
                        <p className={classes.ModalText}>Create New Self-Harvest Event</p>
                        {error && <p className={classes.Error}>{error}</p>}
                        {success && <p className={classes.Success}>{success}</p>}

                        <form onSubmit={handleSubmit}>
                            <div className={classes.ModalDate}>
                                <div>
                                    <label htmlFor="start_date">Start Date:</label>
                                    <input
                                        type="datetime-local"
                                        id="start_date"
                                        value={newHarvest.start_date || ''}
                                        onChange={(e) => setNewHarvest({...newHarvest, start_date: e.target.value})}
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="end_date">End Date:</label>
                                    <input
                                        type="datetime-local"
                                        id="end_date"
                                        value={newHarvest.end_date || ''}
                                        onChange={(e) => setNewHarvest({...newHarvest, end_date: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className={classes.ModalActions}>
                                    <button type="submit" className={classes.ApproveButton}>
                                        Create Event
                                    </button>
                                    <button type="button" onClick={handleCloseModal}
                                            className={classes.DisapproveButton}>
                                        Cancel
                                    </button>
                                </div>
                            </div>


                        </form>
                    </div>
                </div>
            )}

            {modalOpen && editHarvest && (
                <div className={classes.ModalOverlay}>
                    <div className={classes.Modal}>
                        <h3>Edit Self-Harvest Event</h3>
                        {error && <p className={classes.Error}>{error}</p>}
                        {success && <p className={classes.Success}>{success}</p>}

                        <form onSubmit={handleEditSubmit}>
                            <label htmlFor="start_date">Start Date:</label>
                            <input
                                type="datetime-local"
                                id="start_date"
                                value={editHarvest.start_date || ''}
                                onChange={(e) =>
                                    setEditHarvest({...editHarvest, start_date: e.target.value})
                                }
                                required
                            />

                            <label htmlFor="end_date">End Date:</label>
                            <input
                                type="datetime-local"
                                id="end_date"
                                value={editHarvest.end_date || ''}
                                onChange={(e) =>
                                    setEditHarvest({...editHarvest, end_date: e.target.value})
                                }
                                required
                            />

                            <div className={classes.ModalActions}>
                                <button type="submit" className={classes.ApproveButton}>
                                    Save Changes
                                </button>
                                <button type="button" onClick={handleCloseModal} className={classes.DisapproveButton}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    )
}