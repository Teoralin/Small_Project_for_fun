import { useEffect, useState } from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import api from '../../api';
import { jwtDecode } from 'jwt-decode';
import classes from './ProductsPage.module.css';

export default function ProductsPage() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [offers, setOffers] = useState([]);
    const [offerRatings, setOfferRatings] = useState({});
    const [userRole, setUserRole] = useState('');
    const [isFarmer, setIsFarmer] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [purchaseOffer, setPurchaseOffer] = useState(null);
    const [purchaseQuantity, setPurchaseQuantity] = useState(0);
    const [newOffer, setNewOffer] = useState({
        price: '',
        quantity: '',
        is_pickable: false,
    });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();


    useEffect(() => {
        const checkUserRole = () => {
            const token = localStorage.getItem('token');
            if (!token) {
                console.log("not auth")
                setError('You must be logged in to add items to the cart.');
                return;
            }

            try {
                const decodedToken = jwtDecode(token);
                setUserRole(decodedToken.role)
                setIsFarmer(decodedToken.is_farmer);
            } catch (err) {
                console.error('Error decoding token:', err);
            }
        };

        checkUserRole();
    }, []);

    useEffect(() => {
        const fetchProductAndOffers = async () => {
            try {
                const productResponse = await api.get(`/products/${id}`);
                setProduct(productResponse.data);

                const offersResponse = await api.get('/offers');
                const productOffers = offersResponse.data.filter(
                    (offer) => offer.product_id === parseInt(id)
                );
                setOffers(productOffers);

                const offersWithHarvests = await Promise.all(
                    offersResponse.data.map(async (offer) => {
                        // Fetch self-harvest events for pickable offers
                        if (offer.is_pickable) {
                            const selfHarvestEvents = await fetchSelfHarvestEvents(offer.offer_id);
                            return { ...offer, selfHarvestEvents };
                        } else {
                            return { ...offer, selfHarvestEvents: [] };
                        }
                    })
                );

                setOffers(offersWithHarvests);

                const ratings = await Promise.all(
                    productOffers.map(async (offer) => {
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
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Error fetching product or offers data.');
            }
        };

        fetchProductAndOffers();
    }, [id]);

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

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewOffer((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleRemoveProduct = async () => {
        try {
            await api.delete(`/products/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            setSuccessMessage('Product removed successfully!');
            navigate('/categories');
            setError('');
        } catch (err) {
            console.error('Error removing product:', err);
            setError('Error removing product. Please try again later.');
        }
    };

    const handleAddOffer = async () => {
        const token = localStorage.getItem('token');
        try {
            const payload = {
                ...newOffer,
                product_id: parseInt(id),
                user_id: jwtDecode(token).userId,
            };

            await api.post('/offers', payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setSuccessMessage('Offer added successfully!');
            setError('');
            setShowForm(false);
            setNewOffer({ price: '', quantity: '', is_pickable: false });

            const offersResponse = await api.get('/offers');
            const productOffers = offersResponse.data.filter(
                (offer) => offer.product_id === parseInt(id)
            );
            setOffers(productOffers);
        } catch (err) {
            console.error('Error adding offer:', err);
            setError('Error adding offer.');
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
            setPurchaseOffer(null); // Reset purchase offer
        } catch (err) {
            console.error('Error adding to cart:', err);
            setError('Error adding item to cart.');
        }
    };

    if (error) {
        return <div className={classes.ProductsPage}>{error}</div>;
    }

    if (!product) {
        return <div className={classes.ProductsPage}>Loading...</div>;
    }

    return (
        <div className={classes.ProductsPage}>
            <p className={classes.PageTitle}>{product.name}</p>
            <p>{product.description}</p>

            <p className={classes.Title}>Offers</p>

            {(userRole === 'Moderator' || userRole === 'Administrator') && (
                <button onClick={handleRemoveProduct} className={classes.RemoveProductButton}>
                    Remove Current Product
                </button>
            )}

            {isFarmer && (
                <div className={classes.AddOffer}>
                    {showForm ? (
                        <div className={classes.OfferForm}>
                            <div>
                                <label className={classes.Update}>
                                    Price:
                                    <input
                                        type="number"
                                        name="price"
                                        value={newOffer.price}
                                        onChange={handleInputChange}
                                    />
                                </label>
                            </div>
                            <div>
                                <label className={classes.Update}>
                                    Quantity:
                                    <input
                                        type="number"
                                        name="quantity"
                                        value={newOffer.quantity}
                                        onChange={handleInputChange}
                                    />
                                </label>
                            </div>
                           
                            <button onClick={handleAddOffer} className={classes.SubmitButton}>Submit</button>
                            <button onClick={() => setShowForm(false)} className={classes.CancelButton}>Cancel</button>
                        </div>
                    ) : (
                        <button onClick={() => setShowForm(true)} className={classes.AddOfferButton}>
                            Add Offer
                        </button>
                    )}
                </div>
            )}

            <div className={classes.separator}></div>


            {offers.length > 0 ? (
                <ul className={classes.OfferList}>
                    {offers.map((offer) => (
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
                                <div className={classes.selfHarvestEvents}>
                                    <h4>Self-Harvest Events</h4>
                                    {offer.selfHarvestEvents && offer.selfHarvestEvents.length > 0 ? (
                                        <div className={classes.selfHarvestList}>
                                            {offer.selfHarvestEvents.map((event) => (
                                                <div key={event.event_id} className={classes.selfHarvestCard}>
                                                    <p>Harvest start date: {event.start_date}</p>
                                                    <p>Harvest end date: {event.end_date}</p>
                                                    {event.Address && (
                                                        <div className={classes.eventAddress}>
                                                            <h5>Event Address</h5>
                                                            <p>city: {event.Address.city}, postcode: {event.Address.post_code}</p>
                                                            <p>street: {event.Address.street}, house: {event.Address.house_number}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p>No self-harvest events yet.</p>
                                    )}
                                </div>

                                {purchaseOffer?.offer_id === offer.offer_id ? (
                                    <div className={classes.PurchaseForm}>
                                        <p className={classes.Text}>
                                            Quantity:
                                            <input
                                                type="number"
                                                value={purchaseQuantity}
                                                onChange={(e) => setPurchaseQuantity(parseInt(e.target.value, 10))}
                                            />
                                        </p>

                                        <p className={classes.Text}>
                                            Total: {purchaseQuantity > 0 ? purchaseQuantity * offer.price : 0} CZK
                                        </p>

                                        <button onClick={handleSubmitPurchase} className={classes.PurchaseButton}>
                                            Add to cart
                                        </button>
                                        <button
                                            onClick={() => setPurchaseOffer(null)}
                                            className={classes.CancelButton}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handlePurchaseClick(offer)}
                                        className={classes.PurchaseButton}
                                    >
                                        Add to cart
                                    </button>
                                )}
                            </div>
                            <div className={classes.separator}></div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No offers available for this product.</p>
            )}

            {successMessage && <p className={classes.SuccessMessage}>{successMessage}</p>}
        </div>
    );

}
