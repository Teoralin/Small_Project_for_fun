import { useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';
import api from '../../api';
import classes from'./FarmerPage.module.css'; 
import { useParams } from 'react-router-dom';

export default function FarmerPage() {
    const { farmerId } = useParams(); 
    const [userOffers, setUserOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [purchaseOffer, setPurchaseOffer] = useState(null);
    const [purchaseQuantity, setPurchaseQuantity] = useState(0);
    const [offerRatings, setOfferRatings] = useState({}); 
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                if (!farmerId) {
                    setError('Farmer ID not found');
                    setLoading(false);
                    return;
                }

                console.log(farmerId);
                const response = await api.get(`/offers/user/${farmerId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                console.log(response);

                const offersWithHarvests = await Promise.all(
                    response.data.map(async (offer) => {
                        // Fetch self-harvest events for pickable offers
                        if (offer.is_pickable) {
                            const selfHarvestEvents = await fetchSelfHarvestEvents(offer.offer_id);
                            return { ...offer, selfHarvestEvents };
                        } else {
                            return { ...offer, selfHarvestEvents: [] };
                        }
                    })
                );

                setUserOffers(offersWithHarvests);


                const ratings = await Promise.all(
                    response.data.map(async (offer) => {
                        const ratingResponse = await api.get(
                            `/reviews/getAverage/${offer.offer_id}`
                        );
                        return { offer_id: offer.offer_id, averageRating: ratingResponse.data.averageRating };
                    })
                );

                const ratingsMap = {};
                ratings.forEach((rating) => {
                    ratingsMap[rating.offer_id] = rating.averageRating;
                });

                setOfferRatings(ratingsMap);

                setLoading(false);


            } catch (err) {
                setError(err.response?.data?.message || 'Error fetching offers');
                setLoading(false);
            }
        };

        fetchOffers();
    }, [farmerId]);

    const fetchSelfHarvestEvents = async (offerId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await api.get(`/harvests/offer/${offerId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;  
        } catch (err) {
            console.error('Error fetching self-harvest events:', err);
            setError('Failed to fetch self-harvest events');
            return [];
        }
    };

    const handlePurchaseClick = (offer) => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('You must be logged in to purchase.');
            return;
        }

        try {
            const decodedToken = jwtDecode(token);
            if (!decodedToken.role) {
                setError('Only registered users can purchase.');
                return;
            }

            setPurchaseOffer(offer);
            setPurchaseQuantity(0);
            setError('');
            setModalOpen(true); // Open the modal
        } catch (err) {
            console.error('Error decoding token:', err);
            setError('Invalid token.');
        }
    };

    const handleSubmitPurchase = async () => {
        if (purchaseQuantity <= 0 || purchaseQuantity > purchaseOffer.quantity) {
            setError('Invalid quantity. Please check the available stock.');
            return;
        }

        const token = localStorage.getItem('token');
        try {
            await api.post(
                '/cart/add',
                {
                    offer_id: purchaseOffer.offer_id,
                    quantity: purchaseQuantity,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setSuccessMessage('Item added to cart successfully!');
            setError('');
            setModalOpen(false); // Close the modal after successful purchase
            setPurchaseOffer(null); // Reset the purchase offer
        } catch (err) {
            console.error('Error adding to cart:', err);
            setError('Error adding item to cart.');
        }
    };

    if(loading){
        return <div>Loading...</div>;
    }
    if(error){
        return <div>{error}</div>;
    }

    return (
        <div className="farmer-page">
            <h1>My Offers</h1>
            {userOffers.length === 0 ? (
                <p>No offers available. Add some to get started!</p>
            ) : (
                <div className="offers-list">
                    {userOffers.map((offer) => (
                        <li key={offer.offer_id} className={classes.OfferItem}>
                            <div className={classes.OfferCompo}>
                                <p className={classes.Text}>
                                    Price: {offer.price} CZK
                                </p>
                                <p className={classes.Text}>
                                    Quantity: {offer.quantity}
                                </p>
                                <p className={classes.Text}>
                                    Pickable: {offer.is_pickable ? 'Yes' : 'No'}
                                </p>
                                <p className={classes.Text}>
                                    Average Rating: {offerRatings[offer.offer_id] || 'No ratings yet'}
                                </p>
                                <button
                                    onClick={() => handlePurchaseClick(offer)}
                                    className="purchase-button"
                                >
                                    Buy
                                </button>

                            </div>
                        </li>
                    ))}
                </div>
            )}

            {/* Purchase Modal */}
            {modalOpen && purchaseOffer && (
                 <div className={classes.ModalOverlay}>
                    <h2>Purchase {purchaseOffer.title}</h2>
                    <p>Available: {purchaseOffer.quantity}</p>
                    <input
                        type="number"
                        min="1"
                        max={purchaseOffer.quantity}
                        value={purchaseQuantity}
                        onChange={(e) => setPurchaseQuantity(Number(e.target.value))}
                        placeholder="Enter quantity"
                    />
                    <button onClick={handleSubmitPurchase}>Confirm Purchase</button>
                </div>
            )}

            {successMessage && <p className="success-message">{successMessage}</p>}
        </div>
    );
};
