import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { jwtDecode } from 'jwt-decode';
import classes from "./OrdersListPage.module.css";

export default function OrdersListPage() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [expandedOrderId, setExpandedOrderId] = useState(null); // To track expanded orders
    const [offers, setOffers] = useState({}); // Store offers for each order
    const [error, setError] = useState('');
    const [userRole, setUserRole] = useState('');
    const [farmer, setFarmer] = useState('');

    // Decode token and check user role
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
        <div className={classes.OrdersListPage}>
            <div className={classes.Options}>
                <button type="Option"
                        className={classes.OptionButton}
                        onClick={() => handleNavigate('/profile')}
                >
                    Contact information
                </button>
                <button type="Option"
                        className={classes.OptionButtonSelected}
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

            <div className={classes.Orders}>
                <p className={classes.PageTitle}>Orders</p>
                {error ? (
                    <p>{error}</p>
                ) : orders.length === 0 ? (
                    <p>No orders found.</p>
                ) : (
                    <ul className={classes.OrderList}>
                        {orders.map((order) => (
                            <li key={order.order_id}>
                                <div
                                    onClick={() => toggleOrderDetails(order.order_id)}
                                    style={{cursor: 'pointer'}}
                                >
                                    <p>
                                        <strong>Order ID:</strong> {order.order_id}
                                    </p>
                                    <p>
                                        {new Date(order.date).toLocaleDateString('cs-CZ')} | {order.amount} CZK
                                    </p>
                                </div>
                                {expandedOrderId === order.order_id && (
                                    <div>
                                        {offers[order.order_id] && (
                                            <ul className={classes.OrderList}>
                                                {offers[order.order_id].map((offer, index) => (
                                                    <li key={index} className={classes.OrderInfo}>
                                                        <p>
                                                            Offer Name: {offer.offer_name}
                                                        </p>
                                                        <p>
                                                            Price: {offer.price} CZK
                                                        </p>
                                                        <p>
                                                            Quantity: {offer.quantity}
                                                        </p>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                )}
                                <div className={classes.separator}></div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>


        </div>
    );
}
