import { useEffect, useState } from 'react';
import api from '../../api';
import { jwtDecode } from 'jwt-decode';
import classes from "./ReviewPage.module.css";
import {useNavigate} from "react-router-dom";

export default function ReviewPage() {
    const [offers, setOffers] = useState([]);
    const [reviews, setReviews] = useState({});
    const [error, setError] = useState('');
    const [modalData, setModalData] = useState(null);
    const [rating, setRating] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();
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
        const fetchOffersAndReviews = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                setError('You must be logged in to view your offers.');
                return;
            }

            try {
                const decodedToken = jwtDecode(token);
                const userId = decodedToken.userId;

                const offersResponse = await api.get(
                    `/orders/getAllOffersForUser/${userId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const fetchedOffers = offersResponse.data;

                const reviewsResponse = await Promise.all(
                    fetchedOffers.map(async (offer) => {
                        try {
                            const review = await api.get(
                                `/reviews/${userId}/${offer.offer_id}`,
                                {
                                    headers: {
                                        Authorization: `Bearer ${token}`,
                                    },
                                }
                            );
                            return { offer_id: offer.offer_id, review: review.data };
                        } catch {
                            return { offer_id: offer.offer_id, review: null };
                        }
                    })
                );

                const reviewsMap = {};
                reviewsResponse.forEach((res) => {
                    reviewsMap[res.offer_id] = res.review;
                });

                setOffers(fetchedOffers);
                setReviews(reviewsMap);
                setError('');
            } catch (err) {
                console.error('Error fetching offers and reviews:', err);
                setError('Error fetching offers. Please try again later.');
            } 
        };

        fetchOffersAndReviews();
    }, []);

    // Handle opening the modal
    const handleOpenModal = (offer) => {
        setModalData(offer);
        setRating(reviews[offer.offer_id]?.rating || '');
        setSuccessMessage('');
    };

    // Handle closing the modal
    const handleCloseModal = () => {
        setModalData(null);
    };

    const handleNavigate = (path) => {
        navigate(path);
    };

    // Handle submitting the review
    const handleSubmitReview = async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            setError('You must be logged in to submit a review.');
            return;
        }

        if (!rating || rating < 1 || rating > 5) {
            setError('Rating must be a number between 1 and 5.');
            return;
        }

        try {
            const decodedToken = jwtDecode(token);
            const userId = decodedToken.userId;

            if (reviews[modalData.offer_id]) {
                await api.put(
                    `/reviews/${reviews[modalData.offer_id].review_id}`,
                    {
                        rating,
                        user_id: userId,
                        offer_id: modalData.offer_id,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

            } else {
                await api.post(
                    `/reviews`,
                    {
                        rating,
                        user_id: userId,
                        offer_id: modalData.offer_id,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
            }

            setSuccessMessage('Review submitted successfully!');
            setError('');
            handleCloseModal();

            setReviews((prev) => ({
                ...prev,
                [modalData.offer_id]: { rating },
            }));
        } catch (err) {
            console.error('Error submitting review:', err);
            setError('Error submitting review. Please try again later.');
        }
    };


    return (
        <div className={classes.ReviewPage}>
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
                        className={classes.OptionButtonSelected}
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
                 {userRole === "Administrator"&& (
                    <button type="Option"
                            className={classes.OptionButton}
                            onClick={() => handleNavigate('/editUsersList')}
                    >
                        Manage Users
                    </button>
                )}
                {(userRole === "Moderator" || userRole === "Administrator") && (
                    <button type="Option"
                            className={classes.OptionButton}
                            onClick={() => handleNavigate('/categories')}
                    >
                        Manage Categories
                    </button>
                )}
            </div>

            <div className={classes.Review}>
                <p className={classes.PageTitle}>Your last purchased offers</p>
                <ul className={classes.ReviewList}>
                    {offers.map((offer) => (
                        <li key={offer.offer_id} style={{marginBottom: '1em'}}>
                            <p>
                                Product Name: {offer.product_name}
                            </p>
                            <p>
                                Price: {offer.price} CZK
                            </p>
                            {reviews[offer.offer_id] ? (
                                <button onClick={() => handleOpenModal(offer)} className={classes.ReviewButton}>Edit Review</button>
                            ) : (
                                <button onClick={() => handleOpenModal(offer)} className={classes.ReviewButton}>Add Review</button>
                            )}

                            <div className={classes.separator}></div>
                        </li>
                    ))}
                </ul>

                {modalData && (
                    <div className={classes.ModalOverlay}>
                        <div className={classes.Modal}>
                            <p className={classes.ModalText}>Review for {modalData.product_name}</p>
                            {successMessage && <p className={classes.Success}>{successMessage}</p>}
                            {error && <p className={classes.Error}>{error}</p>}

                            <form onSubmit={handleSubmitReview}>
                                <div className={classes.ModalDate}>
                                    <div>
                                        <label htmlFor="rating">Rating (1 to 5):</label>
                                        <input
                                            type="number"
                                            id="rating"
                                            value={rating}
                                            onChange={(e) => setRating(Number(e.target.value))}
                                            required
                                            min="1"
                                            max="5"
                                        />
                                    </div>

                                    <div className={classes.ModalActions}>
                                        <button type="submit" className={classes.ApproveButton}>
                                            {reviews[modalData.offer_id] ? 'Update Review' : 'Submit Review'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleCloseModal}
                                            className={classes.DisapproveButton}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                )}


            </div>

        </div>
    );
}
