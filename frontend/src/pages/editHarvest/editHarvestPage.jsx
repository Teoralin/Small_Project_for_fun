import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import classes from "./editHarvestPage.module.css";

export default function editHarvest() {

    const location = useLocation();
    const { offerId, userId } = location.state || {}; // Extract data from state
    const [addressId, setAddressId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        offer_id: offerId,
        address_id: 0,
        start_date: '',
        end_date: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    // Fetch addressId for the given userId
    useEffect(() => {
        if (userId) {
            axios.get(`http://localhost:3000/addresses/${userId}`)
                .then((response) => {
                    setAddressId(response.data.address_id); // Get address_id
                    setLoading(false); // Set loading to false after the response
                })
                .catch((error) => {
                    console.error("Error fetching address ID:", error);
                    setLoading(false);
                    setError('Error fetching address data');
                });
        }
    }, [userId]);

    // // Update formData when addressId is fetched
    useEffect(() => {
        if (addressId) {
            setFormData((prevData) => ({
                ...prevData,
                address_id: addressId, // Update the address_id once it's fetched
            }));
        }
    }, [addressId]);

    // Handle form input changes
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {

            const payload = {
                offer_id: formData.offer_id,
                address_id: formData.address_id,
                start_date: formData.start_date,
                end_date: formData.end_date,
            };

            const response = await axios.post('http://localhost:3000/harvests', payload);
            setSuccess('Self-harvest event created successfully!');
            setTimeout(() => {
                navigate('/offersList'); // Redirect to offers list or another relevant page
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Error creating self-harvest event');
        }
    };

    if (loading) return <div>Loading...</div>;

    if (!offerId || !userId) {
        return <div>Error: Offer ID or User ID is missing!</div>;
    }

    return (
        <div className={classes.SelfHarvestEventForm}>
            <h1>Create a New Self-Harvest Event</h1>
            {error && <p className={classes.error}>{error}</p>}
            {success && <p className={classes.success}>{success}</p>}
            <form onSubmit={handleSubmit}>
                <div className={classes.formGroup}>
                    <label htmlFor="start_date">Start Date</label>
                    <input
                        type="datetime-local"
                        id="start_date"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className={classes.formGroup}>
                    <label htmlFor="end_date">End Date</label>
                    <input
                        type="datetime-local"
                        id="end_date"
                        name="end_date"
                        value={formData.end_date}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" className={classes.submitButton}>Create Event</button>
            </form>
        </div>
    );
}
