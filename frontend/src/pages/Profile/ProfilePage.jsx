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
import Edit from "../../assets/Edit.png";


export default function ProfilePage() {

    const navigate = useNavigate();
    const [userRole, setUserRole] = useState(null);

    const handleNavigate = (path) => {
        navigate(path);
    };

    const [userData, setUserData] = useState(null);
    const [addressData, setAddressData] = useState(null);
    const [error, setError] = useState('');
    const [updatedData, setUpdatedData] = useState({});
    const [updatedAddress, setUpdatedAddress] = useState({});
    const [isEditing, setIsEditing] = useState({
        name: false,
        surname: false,
        email: false,
        contact_info: false,
        street: false,
        house_number: false,
        city: false,
        post_code: false,
    });
    const [successMessage, setSuccessMessage] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);

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


    const handleEdit = (field) => {
        setIsEditing((prev) => ({
            ...prev,
            [field]: true,
        }));
        if (field in userData) {
            setUpdatedData((prev) => ({
                ...prev,
                [field]: userData[field],
            }));
        } else {
            setUpdatedAddress((prev) => ({
                ...prev,
                [field]: addressData[field],
            }));
        }
    };

    const handleInputChange = (field, value) => {
        if (field in updatedData) {
            setUpdatedData((prev) => ({
                ...prev,
                [field]: value,
            }));
        } else {
            setUpdatedAddress((prev) => ({
                ...prev,
                [field]: value,
            }));
        }
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

            // Update user data
            if (Object.values(isEditing).some(val => val === true)) {
                await axios.put(
                    `http://localhost:3000/users/${userId}`,
                    updatedData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
            }

            // Update address data if edited
            if (Object.values(isEditing).some(val => val === true)) {
                await axios.put(
                    `http://localhost:3000/addresses/${userId}`,
                    updatedAddress,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
            }

            setSuccessMessage('Changes saved successfully!');
            setError('');
            setIsEditing({
                name: false,
                surname: false,
                email: false,
                contact_info: false,
                street: false,
                house_number: false,
                city: false,
                post_code: false,
            });

            // Refresh user and address data
            const userResponse = await axios.get(`http://localhost:3000/users/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUserData(userResponse.data);

            if (userResponse.data.is_farmer) {
                const addressResponse = await axios.get(`http://localhost:3000/addresses/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setAddressData(addressResponse.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error updating data');
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
                            <img
                                src={Edit}
                                alt="Edit Icon"
                                className={classes.icon}
                                onClick={() => handleEdit('name')}
                                style={{cursor: 'pointer'}}
                                disabled={isEditing.name}
                            />
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
                            <img
                                src={Edit}
                                alt="Edit Icon"
                                className={classes.icon}
                                onClick={() => handleEdit('surname')}
                                style={{cursor: 'pointer'}}
                                disabled={isEditing.surname}
                            />
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
                            <img
                                src={Edit}
                                alt="Edit Icon"
                                className={classes.icon}
                                onClick={() => handleEdit('email')}
                                style={{cursor: 'pointer'}}
                                disabled={isEditing.email}
                            />
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
                            <img
                                src={Edit}
                                alt="Edit Icon"
                                className={classes.icon}
                                onClick={() => handleEdit('contact_info')}
                                style={{cursor: 'pointer'}}
                                disabled={isEditing.contact_info}
                            />
                        </div>
                    </div>

                    {userData.is_farmer && (
                        <>
                            <div className={classes.formGroup}>
                                <label htmlFor="city">City</label>
                                <div className={classes.form}>
                                    <div className={classes.formLeft}>
                                        <img
                                            src={House}
                                            alt="House Icon"
                                            className={classes.icon}
                                        />
                                        {isEditing.city ? (
                                            <input
                                                type="text"
                                                value={updatedAddress.city || ''}
                                                onChange={(e) => handleInputChange('city', e.target.value)}
                                            />
                                        ) : (
                                            <span>{addressData?.city}</span>
                                        )}
                                    </div>
                                    <img
                                        src={Edit}
                                        alt="Edit Icon"
                                        className={classes.icon}
                                        onClick={() => handleEdit('city')}
                                        style={{cursor: 'pointer'}}
                                        disabled={isEditing.city}
                                    />
                                </div>
                            </div>

                            <div className={classes.formGroup}>
                                <label htmlFor="street">Street</label>
                                <div className={classes.form}>
                                    <div className={classes.formLeft}>
                                        <img
                                            src={House}
                                            alt="House Icon"
                                            className={classes.icon}
                                        />
                                        {isEditing.street ? (
                                            <input
                                                type="text"
                                                value={updatedAddress.street || ''}
                                                onChange={(e) => handleInputChange('street', e.target.value)}
                                            />
                                        ) : (
                                            <span>{addressData?.street}</span>
                                        )}
                                    </div>
                                    <img
                                        src={Edit}
                                        alt="Edit Icon"
                                        className={classes.icon}
                                        onClick={() => handleEdit('street')}
                                        style={{cursor: 'pointer'}}
                                        disabled={isEditing.street}
                                    />
                                </div>
                            </div>

                            <div className={classes.formGroup}>
                                <label htmlFor="house_number">House Number</label>
                                <div className={classes.form}>
                                    <div className={classes.formLeft}>
                                        <img
                                            src={Point}
                                            alt="Point Icon"
                                            className={classes.icon}
                                        />
                                        {isEditing.house_number ? (
                                            <input
                                                type="number"
                                                value={updatedAddress.house_number || ''}
                                                onChange={(e) => handleInputChange('house_number', e.target.value)}
                                            />
                                        ) : (
                                            <span>{addressData?.house_number}</span>
                                        )}
                                    </div>
                                    <img
                                        src={Edit}
                                        alt="Edit Icon"
                                        className={classes.icon}
                                        onClick={() => handleEdit('house_number')}
                                        style={{cursor: 'pointer'}}
                                        disabled={isEditing.house_number}
                                    />
                                </div>
                            </div>

                            <div className={classes.formGroup}>
                                <label htmlFor="post_code">Post Code</label>
                                <div className={classes.form}>
                                    <div className={classes.formLeft}>
                                        <img
                                            src={Point}
                                            alt="Point Icon"
                                            className={classes.icon}
                                        />
                                        {isEditing.post_code ? (
                                            <input
                                                type="number"
                                                value={updatedAddress.post_code || ''}
                                                onChange={(e) => handleInputChange('post_code', e.target.value)}
                                            />
                                        ) : (
                                            <span>{addressData?.post_code}</span>
                                        )}
                                    </div>
                                    <img
                                        src={Edit}
                                        alt="Edit Icon"
                                        className={classes.icon}
                                        onClick={() => handleEdit('post_code')}
                                        style={{cursor: 'pointer'}}
                                        disabled={isEditing.post_code}
                                    />
                                </div>
                            </div>

                        </>
                    )}

                    {Object.values(isEditing).some(val => val === true) && (
                        <button onClick={handleSubmit} className={classes.Submit}>Submit Changes</button>
                    )}


                    <button onClick={() => setIsChangingPassword(true)} className={classes.Change}>
                        Change Password
                    </button>

                    {isChangingPassword && (
                        <div className={classes.formCompo}>
                            <div className={classes.formGroup}>
                                <label>Current Password:</label>
                                <div className={classes.form}>
                                    <div className={classes.formLeft}>
                                        <img
                                            src={Key}
                                            alt="Key Icon"
                                            className={classes.icon}
                                        />
                                        <input
                                            type="password"
                                            value={passwordData.currentPassword}
                                            onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className={classes.formGroup}>
                                <label>New Password:</label>
                                <div className={classes.form}>
                                    <div className={classes.formLeft}>
                                        <img
                                            src={Key}
                                            alt="Key Icon"
                                            className={classes.icon}
                                        />
                                        <input
                                            type="password"
                                            value={passwordData.newPassword}
                                            onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className={classes.formGroup}>
                                <label>Confirm New Password:</label>
                                <div className={classes.form}>
                                    <div className={classes.formLeft}>
                                        <img
                                            src={Key}
                                            alt="Key Icon"
                                            className={classes.icon}
                                        />
                                        <input
                                            type="password"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <button onClick={handlePasswordChangeSubmit} className={classes.Submit}>Submit Password Change</button>
                        </div>
                    )}

                    {successMessage && <p>{successMessage}</p>}
                    {error && <p>{error}</p>}
                </div>
            </div>
        </div>
    );
}
