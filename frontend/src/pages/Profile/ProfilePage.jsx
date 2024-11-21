import { useEffect, useState } from 'react';
import classes from "./ProfilePage.module.css";
import { Link, useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import axios from 'axios';
import User_light from "../../assets/User_light.png";
import MailIcon from "../../assets/Mail.png";
import Phone from "../../assets/Phone.png";
import Key from "../../assets/Key.png";
import Point from "../../assets/Map_Point.png";
import House from "../../assets/House.png";


export default function ProfilePage() {

    const navigate = useNavigate();
    const [userRole, setUserRole] = useState(null);

    const handleNavigate = (path) => {
        navigate(path);
    };

    const [userData, setUserData] = useState(null);
    const [error, setError] = useState('');
    const [addressData, setAddressData] = useState(null);
    const [isEditing, setIsEditing] = useState({
        name: false,
        surname: false,
        email: false,
        contact_info: false,
    });
    const [updatedData, setUpdatedData] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [updatedAddress, setUpdatedAddress] = useState({});
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('User is not logged in');
                    return;
                }

                const decodedToken = jwtDecode(token);
                setUserRole(decodedToken.role);
                const userId = decodedToken.userId;

                const userResponse = await axios.get(`http://localhost:3000/users/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setUserData(userResponse.data);

                // If the user is a farmer, fetch their address
                if (userResponse.data.is_farmer) {
                    const addressResponse = await axios.get(`http://localhost:3000/addresses/${userId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    setAddressData(addressResponse.data);
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Error fetching user data');
            }
        };

        fetchUserData();
    }, []);

    const handleAddressEdit = () => {
        setIsEditingAddress(true);
        setUpdatedAddress(addressData);
    };

    const handleAddressInputChange = (field, value) => {
        setUpdatedAddress((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleAddressSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            const decodedToken = jwtDecode(token);
            const userId = decodedToken.userId;

            await axios.put(
                `http://localhost:3000/addresses/${userId}`,
                updatedAddress,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setSuccessMessage('Address updated successfully!');
            setError('');
            setIsEditingAddress(false);

            // Refresh address data
            const addressResponse = await axios.get(`http://localhost:3000/addresses/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setAddressData(addressResponse.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Error updating address');
        }
    };

    const handleEdit = (field) => {
        setIsEditing((prev) => ({
            ...prev,
            [field]: true,
        }));
        setUpdatedData((prev) => ({
            ...prev,
            [field]: userData[field],
        }));
    };

    const handleInputChange = (field, value) => {
        setUpdatedData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handlePasswordInputChange = (field, value) => {
        setPasswordData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            const decodedToken = jwtDecode(token);
            const userId = decodedToken.userId;

            await axios.put(
                `http://localhost:3000/users/${userId}`,
                updatedData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setSuccessMessage('User updated successfully!');
            setError('');
            setIsEditing({
                name: false,
                surname: false,
                email: false,
                contact_info: false,
            });

            // Refresh user data
            const response = await axios.get(`http://localhost:3000/users/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUserData(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Error updating user data');
        }
    };

    const handlePasswordChangeSubmit = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const decodedToken = jwtDecode(token);
            const userId = decodedToken.userId;

            await axios.put(
                `http://localhost:3000/users/${userId}`,
                {
                    password: passwordData.newPassword,
                    currentPassword: passwordData.currentPassword,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setSuccessMessage('Password updated successfully!');
            setError('');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
            setIsChangingPassword(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Error updating password');
        }
    };

    if (error) {
        return <div>{error}</div>;
    }

    if (!userData) {
        return <div>Loading...</div>;
    }

    return (
        <div className={classes.ProfilePage}>
            <div className={classes.Options}>
                <button type="Option"
                        className={classes.OptionButtonSelected}
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
                        className={classes.OptionButton}
                        onClick={() => handleNavigate('/offersList')}
                >
                    Offers
                </button>
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

            <div className={classes.Contacts}>
                <p>Contact information</p>
                <div className={classes.registerForm}>
                    <div className={classes.formGroup}>
                        <label htmlFor="name">Name</label>
                        <div className={classes.form}>
                            <div className={classes.formLeft}>
                                <img
                                    src={User_light}
                                    alt="User_light Icon"
                                    className={classes.icon}
                                />
                                {isEditing.name ? (
                                    <input
                                        type="text"
                                        value={updatedData.name || ''}
                                        placeholder="Enter your name"
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                    />
                                ) : (
                                    <span>{userData.name}</span>
                                )}
                            </div>
                            <button onClick={() => handleEdit('name')} disabled={isEditing.name}>
                                Edit
                            </button>
                        </div>
                    </div>


                    <div className={classes.formGroup}>
                        <label htmlFor="surname">Surname</label>
                        <div className={classes.form}>
                            <div className={classes.formLeft}>
                                <img
                                    src={User_light}
                                    alt="User_light Icon"
                                    className={classes.icon}
                                />
                                {isEditing.surname ? (
                                    <input
                                        type="text"
                                        value={updatedData.surname || ''}
                                        onChange={(e) => handleInputChange('surname', e.target.value)}
                                    />
                                ) : (
                                    <span>{userData.surname}</span>
                                )}
                            </div>
                                <button onClick={() => handleEdit('surname')} disabled={isEditing.surname}>
                                    Edit
                                </button>
                        </div>
                    </div>


                    <div className={classes.formGroup}>
                        <label htmlFor="email">Email Address</label>
                        <div className={classes.form}>
                            <div className={classes.formLeft}>
                                <img
                                    src={MailIcon}
                                    alt="Mail Icon"
                                    className={classes.icon}
                                />
                                {isEditing.email ? (
                                    <input
                                        type="email"
                                        value={updatedData.email || ''}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                    />
                                ) : (
                                    <span>{userData.email}</span>
                                )}
                            </div>
                            <button onClick={() => handleEdit('email')} disabled={isEditing.email}>
                                Edit
                            </button>
                            </div>
                        </div>


                        <div className={classes.formGroup}>
                        <label htmlFor="phone">Phone Number</label>
                            <div className={classes.form}>
                                <div className={classes.formLeft}>
                                    <img
                                        src={Phone}
                                        alt="Phone Icon"
                                        className={classes.icon}
                                    />
                                    {isEditing.contact_info ? (
                                        <input
                                            type="tel"
                                            value={updatedData.contact_info || ''}
                                            onChange={(e) => handleInputChange('contact_info', e.target.value)}
                                        />
                                    ) : (
                                        <span>{userData.contact_info}</span>
                                    )}
                                </div>
                                <button onClick={() => handleEdit('contact_info')} disabled={isEditing.contact_info}>
                                    Edit
                                </button>
                            </div>
                        </div>

                    <div className={classes.formGroup}>
                        <div className={classes.form}>
                            <div className={classes.formLeft}>

                            </div>
                        </div>
                    </div>

                </div>

                {(isEditing.name || isEditing.surname || isEditing.email || isEditing.contact_info) && (
                    <button onClick={handleSubmit}>
                        Submit Changes
                    </button>
                )}

            </div>




            {userData.is_farmer && (
                <div>
                    <h2>Your Address</h2>
                    {isEditingAddress ? (
                        <div>
                            <div>
                                <label>Street:</label>
                                <input
                                    type="text"
                                    value={updatedAddress.street || ''}
                                    onChange={(e) => handleAddressInputChange('street', e.target.value)}
                                />
                            </div>
                            <div>
                                <label>House Number:</label>
                                <input
                                    type="number"
                                    value={updatedAddress.house_number || ''}
                                    onChange={(e) => handleAddressInputChange('house_number', e.target.value)}
                                />
                            </div>
                            <div>
                                <label>City:</label>
                                <input
                                    type="text"
                                    value={updatedAddress.city || ''}
                                    onChange={(e) => handleAddressInputChange('city', e.target.value)}
                                />
                            </div>
                            <div>
                                <label>Post Code:</label>
                                <input
                                    type="number"
                                    value={updatedAddress.post_code || ''}
                                    onChange={(e) => handleAddressInputChange('post_code', e.target.value)}
                                />
                            </div>
                            <button onClick={handleAddressSubmit}>Submit Address Changes</button>
                        </div>
                    ) : (
                        <div>
                            <div>
                                <strong>Street:</strong> {addressData?.street}
                            </div>
                            <div>
                                <strong>House Number:</strong> {addressData?.house_number}
                            </div>
                            <div>
                                <strong>City:</strong> {addressData?.city}
                            </div>
                            <div>
                                <strong>Post Code:</strong> {addressData?.post_code}
                            </div>
                            <button onClick={handleAddressEdit}>Edit Address</button>
                        </div>
                    )}
                </div>
            )}

            <button onClick={() => setIsChangingPassword(true)}>
                Change Password
            </button>

            {isChangingPassword && (
                <div>
                    <div>
                        <label>Current Password:</label>
                        <input
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                        />
                    </div>
                    <div>
                        <label>New Password:</label>
                        <input
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                        />
                    </div>
                    <div>
                        <label>Confirm New Password:</label>
                        <input
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                        />
                    </div>
                    <button onClick={handlePasswordChangeSubmit}>
                        Submit Password Change
                    </button>
                </div>
            )}

            {successMessage && <p>{successMessage}</p>}
            {error && <p>{error}</p>}
        </div>
    );
}
