import { useEffect, useState } from 'react';
import api from '../../api';
import classes from './CartPage.module.css';

export default function CartPage() {
    const [cartItems, setCartItems] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchCart = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                setError('You must be logged in to view the cart.');
                return;
            }

            try {
                const cartResponse = await api.get('/cart', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const offerDetails = await Promise.all(
                    cartResponse.data.map(async (item) => {
                        if (!item.offer_id) {
                            console.error('Missing offer_id for item:', item);
                            return null;
                        }

                        try {
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
                                quantity: item.quantity,
                            };
                        } catch (err) {
                            console.error(`Error fetching offer with ID ${item.offer_id}:`, err);
                            return null;
                        }
                    })
                );

                const validOffers = offerDetails.filter((offer) => offer !== null);

                setCartItems(validOffers);

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
    }, []);

    const handleRemoveItem = async (offer_id) => {
        const token = localStorage.getItem('token');
        try {
            await api.delete(`/cart/${offer_id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const updatedCart = cartItems.filter((item) => item.offer_id !== offer_id);
            setCartItems(updatedCart);

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

    const handleCheckout = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await api.post(
                '/orders/checkout',
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

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
        <div className={classes.CartPage}>
            {error && <div className={classes.ErrorMessage}>{error}</div>}
            {successMessage && <div className={classes.SuccessMessage}>{successMessage}</div>}

            <p className={classes.PageTitle}>Your Cart</p>

            {cartItems.length === 0 ? (
                <div className={classes.EmptyCart}>
                    {successMessage ? (
                        <div>
                            <h2>{successMessage}</h2>
                        </div>
                    ) : (
                        <div>Your cart is empty.</div>
                    )}
                </div>
            ) : (
                <div className={classes.CartItems}>
                    {cartItems.map((item) => (
                        <div key={item.offer_id} className={classes.CartItem}>
                            <p><strong>Product Name:</strong> {item.Product.name || 'N/A'}</p>
                            <p><strong>Quantity:</strong> {item.quantity}</p>
                            <p><strong>Price per Unit:</strong> {item.price} CZK</p>
                            <p><strong>Total Price:</strong> {item.price * item.quantity} CZK</p>
                            <button onClick={() => handleRemoveItem(item.offer_id)} className={classes.RemoveButton}>Remove</button>

                            <div className={classes.separator}></div>
                        </div>
                    ))}
                    <h2 className={classes.TotalPrice}>Total Price: {totalPrice} CZK</h2>
                    <button onClick={handleCheckout} className={classes.CheckoutButton}>Checkout</button>
                </div>
            )}
        </div>
    );
}

