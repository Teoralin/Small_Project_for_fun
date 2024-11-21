import React, { useState, useEffect } from 'react';
import axios from 'axios';
import classes from './UsersPage.module.css';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);  // For error handling

    useEffect(() => {
        // Fetch users from the API using axios
        async function fetchUsers() {
            try {
                const response = await axios.get('http://localhost:3000/users'); // Adjust the API URL
                setUsers(response.data);  // Set users data
            } catch (error) {
                console.error('Error fetching users:', error);
                setError('An error occurred while fetching users');  // Set error state
            } finally {
                setLoading(false);  // Set loading to false once the request is complete
            }
        }

        fetchUsers();
    }, []);  // Empty dependency array to run the effect once on mount

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className={classes.userPage}>
            <div className={classes.PageTitle}>
                <p>Users</p>
            </div>
            {users.length === 0 ? (
                <p>No users found.</p>
            ) : (
                    <ul className={classes.UserComponent}>
                        {users.map(user => (
                            <li key={user.id} className={classes.userCompo}>
                                <div>
                                    <img
                                        src="https://via.placeholder.com/296x184"
                                        alt="User Avatar"
                                    />
                                </div>

                                <div className={classes.UserInfo}>
                                    {user.name} <br/>
                                    {user.surname}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
        </div>
    );
}
