import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import classes from './ProductsPage.module.css';

export default function ProductsPage() {
    const { id } = useParams(); // Product ID from the URL params
    const [product, setProduct] = useState(null); // Product details
    const [offers, setOffers] = useState([]); // Offers for this product
    const [offerRatings, setOfferRatings] = useState({}); // Ratings for each offer
    const [isFarmer, setIsFarmer] = useState(false); // Check if the user is a farmer
    const [showForm, setShowForm] = useState(false); // Toggle add offer form
    const [purchaseOffer, setPurchaseOffer] = useState(null); // Offer being purchased
    const [purchaseQuantity, setPurchaseQuantity] = useState(0); // Quantity to purchase
    const [newOffer, setNewOffer] = useState({
        price: '',
        quantity: '',
        is_pickable: false,
    });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Check if the logged-in user is a farmer
    useEffect(() => {
        const checkUserRole = () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const decodedToken = jwtDecode(token);
                setIsFarmer(decodedToken.is_farmer); // Set farmer status from JWT token
            } catch (err) {
                console.error('Error decoding token:', err);
            }
        };

        checkUserRole();
    }, []);

    // Fetch product and offers data
    useEffect(() => {
        const fetchProductAndOffers = async () => {
            try {
                // Fetch product details
                const productResponse = await axios.get(`http://localhost:3000/products/${id}`);
                setProduct(productResponse.data);

                // Fetch offers for this product
                const offersResponse = await axios.get('http://localhost:3000/offers');
                const productOffers = offersResponse.data.filter(
                    (offer) => offer.product_id === parseInt(id)
                );
                setOffers(productOffers);

                // Fetch average ratings for offers
                const ratings = await Promise.all(
                    productOffers.map(async (offer) => {
                        const ratingResponse = await axios.get(
                            `http://localhost:3000/reviews/getAverage/${offer.offer_id}`
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

    // Handle input changes for the new offer form
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewOffer((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    // Handle submitting the new offer
    const handleAddOffer = async () => {
        const token = localStorage.getItem('token');
        try {
            const payload = {
                ...newOffer,
                product_id: parseInt(id),
                user_id: jwtDecode(token).userId, // Set user_id from JWT token
            };

            await axios.post('http://localhost:3000/offers', payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setSuccessMessage('Offer added successfully!');
            setError('');
            setShowForm(false);
            setNewOffer({ price: '', quantity: '', is_pickable: false });

            // Refresh offers
            const offersResponse = await axios.get('http://localhost:3000/offers');
            const productOffers = offersResponse.data.filter(
                (offer) => offer.product_id === parseInt(id)
            );
            setOffers(productOffers);
        } catch (err) {
            console.error('Error adding offer:', err);
            setError('Error adding offer.');
        }
    };

    // Handle starting the purchase process
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

            setPurchaseOffer(offer); // Set the current offer being purchased
            setPurchaseQuantity(0); // Reset quantity
            setError('');
        } catch (err) {
            console.error('Error decoding token:', err);
            setError('Invalid token.');
        }
    };

    // Handle submitting the purchase
    const handleSubmitPurchase = async () => {
        if (purchaseQuantity <= 0 || purchaseQuantity > purchaseOffer.quantity) {
            setError('Invalid quantity. Please check the available stock.');
            return;
        }

        const token = localStorage.getItem('token');
        try {
            await axios.post(
                'http://localhost:3000/cart/add',
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

            {isFarmer && (
                <div className={classes.AddOffer}>
                    {showForm ? (
                        <div className={classes.OfferForm}>
                            <div>
                                <label>
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
                                <label>
                                    Quantity:
                                    <input
                                        type="number"
                                        name="quantity"
                                        value={newOffer.quantity}
                                        onChange={handleInputChange}
                                    />
                                </label>
                            </div>
                            <div>
                                <label>
                                    Pickable:
                                    <input
                                        type="checkbox"
                                        name="is_pickable"
                                        checked={newOffer.is_pickable}
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
                                        Buy
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
