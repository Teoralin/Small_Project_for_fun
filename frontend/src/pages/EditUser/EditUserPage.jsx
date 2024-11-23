//edit user only administrator
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import classes from "./EditUserPage.module.css";
import User_light from "../../assets/User_light.png";
import MailIcon from "../../assets/Mail.png";
import Phone from "../../assets/Phone.png";
import Upgrade from "../../assets/Upgrade.png";
import Downgrade from "../../assets/Downgrade.png";
import Delete from "../../assets/Delete.png";

export default function EditUserPage() {
    const { id } = useParams(); // Get the user ID from the URL params
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [farmer, setFarmer] = useState('');

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
                if(decodedToken.is_farmer){
                    setFarmer('farmer');
                }
                setUserRole(decodedToken.role);

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

    const handleNavigate = (path) => {
        navigate(path);
    };

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
        <div className={classes.EditUserPage}>
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
            </div>
            <div className={classes.UserInfo}>
                <div className={classes.Title}>
                    <p>Edit User</p>
                </div>
                <div className={classes.Compo}>

                    <div>
                        <img
                            src="https://via.placeholder.com/433x278"
                            alt="User Avatar"
                        />
                    </div>
                    <div>
                        <div>
                            <div>
                                <label htmlFor="name">Name</label>
                                <div className={classes.form}>
                                    <img
                                        src={User_light}
                                        alt="User_light Icon"
                                        className={classes.icon}
                                    />
                                    <p>{user.name}</p>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="Surname">Surname</label>
                                <div className={classes.form}>
                                    <img
                                        src={User_light}
                                        alt="User_light Icon"
                                        className={classes.icon}
                                    />
                                    <p>{user.surname}</p>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="Email">Email</label>
                                <div className={classes.form}>
                                    <img
                                        src={MailIcon}
                                        alt="Mail Icon"
                                        className={classes.icon}
                                    />
                                    <p>{user.email}</p>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="Phone">Phone</label>
                                <div className={classes.form}>
                                    <img
                                        src={Phone}
                                        alt="Phone Icon"
                                        className={classes.icon}
                                    />
                                    <p>{user.contact_info}</p>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="Role">Role</label>
                                <div className={classes.form}>
                                    <img
                                        src={User_light}
                                        alt="User_light Icon"
                                        className={classes.icon}
                                    />
                                    <p>{user.role}</p>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="Farmer">Farmer</label>
                                <div className={classes.form}>
                                    <img
                                        src={User_light}
                                        alt="User_light Icon"
                                        className={classes.icon}
                                    />
                                    <p>{user.is_farmer ? 'Yes' : 'No'}</p>
                                </div>
                            </div>


                        </div>

                        <div className={classes.ButtonsCompo}>
                            {user.role === 'Registered User' && (
                                <button onClick={handleUpgrade} className={classes.buttonUser}>
                                    <img
                                        src={Upgrade}
                                        alt="Upgrade Icon"
                                        className={classes.icon}
                                    />
                                    Upgrade to Moderator
                                </button>
                            )}

                            {user.role === 'Moderator' && (
                                <button onClick={handleDowngrade} className={classes.buttonUser}>
                                    <img
                                        src={Downgrade}
                                        alt="Downgrade Icon"
                                        className={classes.icon}
                                    />
                                    Downgrade to Registered User
                                </button>
                            )}

                            <button onClick={handleDelete} className={classes.buttonUser}>
                                <img
                                    src={Delete}
                                    alt="Delete Icon"
                                    className={classes.icon}
                                />
                                Delete User
                            </button>
                        </div>
                        {successMessage && <p>{successMessage}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}


