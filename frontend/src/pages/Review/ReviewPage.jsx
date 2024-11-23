import { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export default function ReviewPage() {
    const [offers, setOffers] = useState([]); // List of offers
    const [reviews, setReviews] = useState({}); // Reviews by offer_id
    const [error, setError] = useState(''); // Error handling
    const [loading, setLoading] = useState(true); // Loading state
    const [modalData, setModalData] = useState(null); // Data for the active modal (offer being reviewed)
    const [rating, setRating] = useState(''); // Rating input
    const [successMessage, setSuccessMessage] = useState(''); // Success message

    // Fetch all offers for the logged-in user
    useEffect(() => {
        const fetchOffersAndReviews = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                setError('You must be logged in to view your offers.');
                setLoading(false);
                return;
            }

            try {
                const decodedToken = jwtDecode(token);
                const userId = decodedToken.userId;

                // Fetch offers for the user
                const offersResponse = await axios.get(
                    `http://localhost:3000/orders/getAllOffersForUser/${userId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const fetchedOffers = offersResponse.data;

                // Fetch reviews for each offer
                const reviewsResponse = await Promise.all(
                    fetchedOffers.map(async (offer) => {
                        try {
                            const review = await axios.get(
                                `http://localhost:3000/reviews/${userId}/${offer.offer_id}`,
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

                // Map reviews by offer_id
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
            } finally {
                setLoading(false);
            }
        };

        fetchOffersAndReviews();
    }, []);

    // Handle opening the modal
    const handleOpenModal = (offer) => {
        setModalData(offer); // Set the current offer for the modal
        setRating(reviews[offer.offer_id]?.rating || ''); // Set the current rating if it exists
        setSuccessMessage(''); // Clear any previous success message
    };

    // Handle closing the modal
    const handleCloseModal = () => {
        setModalData(null);
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

            // Submit the review (POST or PUT based on existence)
            if (reviews[modalData.offer_id]) {
                await axios.put(
                    `http://localhost:3000/reviews/${reviews[modalData.offer_id].review_id}`, // Pass the review_id in the URL
                    {
                        rating,
                        user_id: userId,
                        offer_id: modalData.offer_id, // Use the offer_id from the modal data
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

            } else {
                await axios.post(
                    `http://localhost:3000/reviews`,
                    {
                        rating,
                        user_id: userId,
                        offer_id: modalData.offer_id, // Use the offer_id from the modal data
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
            handleCloseModal(); // Close the modal after submission

            // Update the reviews map
            setReviews((prev) => ({
                ...prev,
                [modalData.offer_id]: { rating },
            }));
        } catch (err) {
            console.error('Error submitting review:', err);
            setError('Error submitting review. Please try again later.');
        }
    };

    if (loading) {
        return <div style={{ marginTop: '5em' }}>Loading...</div>;
    }

    if (error) {
        return <div style={{ marginTop: '5em' }}>{error}</div>;
    }

    if (offers.length === 0) {
        return <div style={{ marginTop: '5em' }}>No offers found.</div>;
    }

    return (
        <div style={{ marginTop: '5em' }}>
            <h1>Your Offers</h1>
            <ul>
                {offers.map((offer) => (
                    <li key={offer.offer_id} style={{ marginBottom: '1em' }}>
                        <p>
                            <strong>Product Name:</strong> {offer.product_name}
                        </p>
                        <p>
                            <strong>Price:</strong> {offer.price} CZK
                        </p>
                        {reviews[offer.offer_id] ? (
                            <button onClick={() => handleOpenModal(offer)}>Edit Review</button>
                        ) : (
                            <button onClick={() => handleOpenModal(offer)}>Add Review</button>
                        )}
                    </li>
                ))}
            </ul>

            {/* Modal for adding/editing a review */}
            {modalData && (
                <div
                    style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: 'white',
                        padding: '20px',
                        border: '1px solid black',
                        zIndex: 1000,
                    }}
                >
                    <h2>Review for {modalData.product_name}</h2>
                    <div>
                        <label>
                            Rating (1 to 5):
                            <input
                                type="number"
                                value={rating}
                                onChange={(e) => setRating(Number(e.target.value))}
                            />
                        </label>
                    </div>
                    <button onClick={handleSubmitReview}>
                        {reviews[modalData.offer_id] ? 'Update Review' : 'Submit Review'}
                    </button>
                    <button onClick={handleCloseModal} style={{ marginLeft: '10px' }}>
                        Cancel
                    </button>
                    {successMessage && <p>{successMessage}</p>}
                </div>
            )}
        </div>
    );
}
