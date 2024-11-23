import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { jwtDecode } from 'jwt-decode';

export default function OrdersListPage() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [expandedOrderId, setExpandedOrderId] = useState(null); // To track expanded orders
    const [offers, setOffers] = useState({}); // Store offers for each order
    const [error, setError] = useState('');
    const [userRole, setUserRole] = useState('');

    // Decode token and check user role
    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            setError('You must be logged in to view your orders.');
            return;
        }

        try {
            const decodedToken = jwtDecode(token);
            setUserRole(decodedToken.role);
        } catch (err) {
            console.error('Error decoding token:', err);
            setError('Invalid token. Please log in again.');
        }
    }, []);

    // Fetch user orders
    useEffect(() => {
        const fetchOrders = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                setError('You must be logged in to view your orders.');
                return;
            }

            try {
                // Decode the token to get userId
                const decodedToken = jwtDecode(token);
                const userId = decodedToken.userId;

                // Fetch orders for the specific user
                const response = await api.get(`/orders/by-user`, {
                    params: { userId },  
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setOrders(response.data);
            } catch (err) {
                console.error('Error fetching orders:', err);
                setError('Error fetching orders. Please try again later.');
            }
        };

        fetchOrders();
    }, []);


    // Fetch offers for a specific order
    const fetchOrderOffers = async (orderId) => {
        const token = localStorage.getItem('token');

        try {
            const response = await api.get(`/orders/${orderId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // Store offers for the specific order
            setOffers((prevOffers) => ({
                ...prevOffers,
                [orderId]: response.data,
            }));
        } catch (err) {
            console.error(`Error fetching offers for order ${orderId}:`, err);
        }
    };

    // Handle expanding/collapsing an order
    const toggleOrderDetails = (orderId) => {
        if (expandedOrderId === orderId) {
            setExpandedOrderId(null); // Collapse if already expanded
        } else {
            setExpandedOrderId(orderId); // Expand the order
            if (!offers[orderId]) {
                fetchOrderOffers(orderId); // Fetch offers only if not already fetched
            }
        }
    };

    const handleNavigate = (path) => {
        navigate(path);
    };

    return (
        <div style={{ marginTop: '5em' }}>
            <div>
                <button type="Option" onClick={() => handleNavigate('/profile')}>
                    Contact information
                </button>
                <button type="Option" onClick={() => handleNavigate('/ordersList')}>
                    Orders
                </button>
                <button type="Option" onClick={() => handleNavigate('/offersList')}>
                    Offers
                </button>
                {userRole === 'Administrator' && (
                    <button type="Option" onClick={() => handleNavigate('/editUsersList')}>
                        Manage Users
                    </button>
                )}
            </div>

            <div>
                <h1>Orders</h1>
                {error ? (
                    <p>{error}</p>
                ) : orders.length === 0 ? (
                    <p>No orders found.</p>
                ) : (
                    <ul>
                        {orders.map((order) => (
                            <li key={order.order_id} style={{ marginBottom: '1em' }}>
                                <div
                                    onClick={() => toggleOrderDetails(order.order_id)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <p>
                                        <strong>Order ID:</strong> {order.order_id}
                                    </p>
                                    <p>
                                        <strong>Date:</strong> {new Date(order.date).toLocaleString()}
                                    </p>
                                    <p>
                                        <strong>Total Price:</strong> {order.amount} CZK
                                    </p>
                                </div>
                                {expandedOrderId === order.order_id && (
                                    <div style={{ marginTop: '1em', marginLeft: '1em' }}>
                                        <h4>Offers</h4>
                                        {offers[order.order_id] && (
                                            <ul>
                                                {offers[order.order_id].map((offer, index) => (
                                                    <li key={index}>
                                                        <p>
                                                            <strong>Offer Name:</strong> {offer.offer_name}
                                                        </p>
                                                        <p>
                                                            <strong>Price:</strong> {offer.price} CZK
                                                        </p>
                                                        <p>
                                                            <strong>Quantity:</strong> {offer.quantity}
                                                        </p>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
