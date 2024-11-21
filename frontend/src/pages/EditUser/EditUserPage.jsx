import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';

export default function EditUserPage() {
    const { id } = useParams(); // Get the user ID from the URL params
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isAuthorized, setIsAuthorized] = useState(false);

    // Check for token and user role
    useEffect(() => {
        const checkAuthorization = () => {
            const token = localStorage.getItem('token');

            if (!token) {
                setError('Access denied. Please log in.');
                return;
            }

            try {
                const decodedToken = jwtDecode(token);
                if (decodedToken.role !== 'Administrator') {
                    setError('Access denied. Insufficient permissions.');
                } else {
                    setIsAuthorized(true); // User is authorized
                }
            } catch (err) {
                setError('Invalid token. Please log in again.');
            }
        };

        checkAuthorization();
    }, );

    // Fetch user data by ID
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/users/${id}`);
                setUser(response.data);
            } catch (err) {
                setError('Error fetching user data');
            }
        };

        if (isAuthorized) {
            fetchUser();
        }
    }, [id, isAuthorized]);

    // Handle Upgrade Role
    const handleUpgrade = async () => {
        try {
            await axios.put(`http://localhost:3000/users/${id}`, {
                role: 'Moderator',
            });
            setSuccessMessage('User upgraded to Moderator.');
            setError('');
            setUser({ ...user, role: 'Moderator' });
        } catch (err) {
            setError('Error upgrading user role');
        }
    };

    // Handle Downgrade Role
    const handleDowngrade = async () => {
        try {
            await axios.put(`http://localhost:3000/users/${id}`, {
                role: 'Registered User',
            });
            setSuccessMessage('User downgraded to Registered User.');
            setError('');
            setUser({ ...user, role: 'Registered User' });
        } catch (err) {
            setError('Error downgrading user role');
        }
    };

    // Handle Delete User
    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:3000/users/${id}`);
            setSuccessMessage('User deleted successfully.');
            setError('');
            navigate('/editUsersList'); // Redirect back to the users list page
        } catch (err) {
            setError('Error deleting user');
        }
    };

    if (error) {
        return <div>{error}</div>;
    }

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Edit User</h1>
            <div>
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Surname:</strong> {user.surname}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Phone:</strong> {user.contact_info}</p>
                <p><strong>Role:</strong> {user.role}</p>
                <p><strong>Farmer:</strong> {user.is_farmer ? 'Yes' : 'No'}</p>
            </div>

            <div>
                <button onClick={handleUpgrade}>Upgrade to Moderator</button>
                <button onClick={handleDowngrade}>Downgrade to Registered User</button>
                <button onClick={handleDelete}>Delete User</button>
            </div>

            {successMessage && <p>{successMessage}</p>}
        </div>
    );
}

