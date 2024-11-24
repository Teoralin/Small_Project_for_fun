import { useEffect, useState } from 'react';
import classes from "./ProfilePage.module.css";
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../../api';
import User_light from "../../assets/User_light.png";
import MailIcon from "../../assets/Mail.png";
import Phone from "../../assets/Phone.png";
import Key from "../../assets/Key.png";

export default function ProfilePage() {

    const navigate = useNavigate();
    const [userRole, setUserRole] = useState(null);
    const [farmer, setFarmer] = useState('');

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
                if (decodedToken.is_farmer) {
                    setFarmer('farmer');
                }
                setUserRole(decodedToken.role);
                const userId = decodedToken.userId;

                const userResponse = await api.get(`/users/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setUserData(userResponse.data);

                // If the user is a farmer, fetch their address
                if (userResponse.data.is_farmer) {
                    const addressResponse = await api.get(`/addresses/${userId}`, {
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
                await api.put(
                    `/users/${userId}`,
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
                await api.put(
                    `/addresses/${userId}`,
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
            const userResponse = await api.get(`/users/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUserData(userResponse.data);

            if (userResponse.data.is_farmer) {
                const addressResponse = await api.get(`/addresses/${userId}`, {
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

            await api.put(
                `/users/${userId}`,
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
                {userRole === "Administrator" || userRole === "Moderator" && (
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

            <div className={classes.Contacts}>
                <p className={classes.PageTitle}>Contact information</p>
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
                                    <span onClick={() => handleEdit('name')}>{userData.name}</span>
                                )}
                            </div>
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
                                    <span onClick={() => handleEdit('surname')}>{userData.surname}</span>
                                )}
                            </div>
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
                                    <span onClick={() => handleEdit('email')}>{userData.email}</span>
                                )}
                            </div>
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
                                    <span onClick={() => handleEdit('contact_info')}>{userData.contact_info}</span>
                                )}
                            </div>
                        </div>
                    </div>


                    <button onClick={handleSubmit} className={classes.Submit}>Submit Changes</button>

                    <button onClick={() => setIsChangingPassword(prev => !prev)} className={classes.Change}>
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
