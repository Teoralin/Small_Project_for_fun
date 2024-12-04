import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { jwtDecode } from 'jwt-decode';
import classes from "./OrdersListPage.module.css";

export default function OrdersListPage() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [offers, setOffers] = useState({});
    const [error, setError] = useState('');
    const [userRole, setUserRole] = useState('');
    const [farmer, setFarmer] = useState('');

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
        const fetchOrders = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                setError('You must be logged in to view your orders.');
                return;
            }

            try {
                const decodedToken = jwtDecode(token);
                const userId = decodedToken.userId;

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


    const fetchOrderOffers = async (orderId) => {
        const token = localStorage.getItem('token');

        try {
            const response = await api.get(`/orders/${orderId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setOffers((prevOffers) => ({
                ...prevOffers,
                [orderId]: response.data,
            }));
        } catch (err) {
            console.error(`Error fetching offers for order ${orderId}:`, err);
        }
    };

    const toggleOrderDetails = (orderId) => {
        if (expandedOrderId === orderId) {
            setExpandedOrderId(null);
        } else {
            setExpandedOrderId(orderId);
            if (!offers[orderId]) {
                fetchOrderOffers(orderId);
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
                 {userRole === "Administrator"  && (
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
                                    className={classes.OrderInformation}
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
