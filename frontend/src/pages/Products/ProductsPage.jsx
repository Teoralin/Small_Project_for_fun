import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';

export default function ProductsPage() {
    const { id } = useParams(); // Product ID from the URL params
    const [product, setProduct] = useState(null); // Product details
    const [offers, setOffers] = useState([]); // Offers for this product
    const [isFarmer, setIsFarmer] = useState(false); // Check if the user is a farmer
    const [showForm, setShowForm] = useState(false); // Toggle add offer form
    const [newOffer, setNewOffer] = useState({
        price: '',
        quantity: '',
        status: 'Available',
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
            setNewOffer({ price: '', quantity: '', status: 'Available', is_pickable: false });

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

    if (error) {
        return <div>{error}</div>;
    }

    if (!product) {
        return <div>Loading...</div>;
    }

    return (
        <div className="ProductsPage" style={{ marginTop: '5em' }}>
            <h1>{product.name}</h1>
            <p>{product.description}</p>

            <h2>Offers</h2>
            {offers.length > 0 ? (
                <ul>
                    {offers.map((offer) => (
                        <li key={offer.offer_id} style={{ marginBottom: '15px' }}>
                            <p><strong>Price:</strong> {offer.price} CZK</p>
                            <p><strong>Quantity:</strong> {offer.quantity}</p>
                            <p><strong>Status:</strong> {offer.status}</p>
                            <p>
                                <strong>Pickable:</strong> {offer.is_pickable ? 'Yes' : 'No'}
                            </p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No offers available for this product.</p>
            )}

            {/* Add Offer Button for Farmers */}
            {(
                <div>
                    <button onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : 'Add Offer'}
                    </button>

                    {showForm && (
                        <div>
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
                            <button onClick={handleAddOffer}>Submit</button>
                        </div>
                    )}
                </div>
            )}

            {successMessage && <p>{successMessage}</p>}
        </div>
    );
}
