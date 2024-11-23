import { useEffect, useState } from 'react';
import api from '../../api';

export default function CartPage() {
    const [cartItems, setCartItems] = useState([]); // Cart items
    const [totalPrice, setTotalPrice] = useState(0); // Total price of all items
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState(''); // Success message

    // Fetch cart items and offers
    useEffect(() => {
        const fetchCart = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                setError('You must be logged in to view the cart.');
                return;
            }

            try {
                // Fetch cart items
                const cartResponse = await api.get('/cart', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                // Fetch details for each offer in the cart using offer_id
                const offerDetails = await Promise.all(
                    cartResponse.data.map(async (item) => {
                        if (!item.offer_id) {
                            console.error('Missing offer_id for item:', item);
                            return null;
                        }

                        try {
                            // Fetch offer details by offer_id
                            const offerResponse = await api.get(
                                `/offers/${item.offer_id}`, // Fetch by offer_id
                                {
                                    headers: {
                                        Authorization: `Bearer ${token}`,
                                    },
                                }
                            );

                            return {
                                ...offerResponse.data,
                                quantity: item.quantity, // Include quantity from the cart
                            };
                        } catch (err) {
                            console.error(`Error fetching offer with ID ${item.offer_id}:`, err);
                            return null; // Skip this offer if there's an error
                        }
                    })
                );

                // Filter out any null responses (e.g., missing or invalid offer_id)
                const validOffers = offerDetails.filter((offer) => offer !== null);

                setCartItems(validOffers);

                // Calculate total price
                const total = validOffers.reduce(
                    (acc, item) => acc + item.price * item.quantity,
                    0
                );
                setTotalPrice(total);
            } catch (err) {
                console.error('Error fetching cart data:', err);
                setError('Error fetching cart data.');
            }
        };

        fetchCart();
    }, []); // Run on component mount

    // Remove item from the cart
    const handleRemoveItem = async (offer_id) => {
        const token = localStorage.getItem('token');
        try {
            // Call the backend route to remove the item from the cart
            await api.delete(`/cart/${offer_id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // Update cart state
            const updatedCart = cartItems.filter((item) => item.offer_id !== offer_id);
            setCartItems(updatedCart);

            // Update total price
            const updatedTotal = updatedCart.reduce(
                (acc, item) => acc + item.price * item.quantity,
                0
            );
            setTotalPrice(updatedTotal);
        } catch (err) {
            console.error('Error removing item from cart:', err);
            setError('Error removing item from cart.');
        }
    };

    // Handle checkout
    const handleCheckout = async () => {
        const token = localStorage.getItem('token');
        try {
            // Call the backend checkout route
            const response = await api.post(
                '/orders/checkout',
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Clear the cart and show success message
            setCartItems([]);
            setTotalPrice(0);
            setSuccessMessage(response.data.message);
            setError('');
        } catch (err) {
            console.error('Error during checkout:', err);
            setError('Error during checkout. Please try again.');
        }
    };

    if (error) {
        return <div>{error}</div>;
    }

    if (cartItems.length === 0) {
        return (
            <div style={{ marginTop: '5em' }}>
                {successMessage ? (
                    <div>
                        <h2>{successMessage}</h2>
                    </div>
                ) : (
                    <div>Your cart is empty.</div>
                )}
            </div>
        );
    }

    return (
        <div style={{ marginTop: '5em' }}>
            <h1>Cart</h1>
            <ul>
                {cartItems.map((item) => (
                    <li key={item.offer_id} style={{ marginBottom: '1em' }}>
                        <p><strong>Offer Name:</strong> {item.Product.name || 'N/A'}</p>
                        <p><strong>Quantity:</strong> {item.quantity}</p>
                        <p><strong>Price per Unit:</strong> {item.price} CZK</p>
                        <p><strong>Total Price:</strong> {item.price * item.quantity} CZK</p>
                        <button onClick={() => handleRemoveItem(item.offer_id)}>Remove</button>
                    </li>
                ))}
            </ul>
            <h2>Total Price: {totalPrice} CZK</h2>
            <button onClick={handleCheckout}>Checkout</button>
            {successMessage && <p>{successMessage}</p>}
        </div>
    );
}

