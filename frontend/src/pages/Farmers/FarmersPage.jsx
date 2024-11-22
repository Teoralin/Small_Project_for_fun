import React, { useState, useEffect } from 'react';
import axios from 'axios';
import classes from './FarmersPage.module.css';

export default function FarmersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filteredUsers, setFilteredUsers] = useState([]); 
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null); 

    useEffect(() => {
        // Fetch users from the API using axios
        async function fetchUsers() {
            try {
                const response = await axios.get('http://localhost:3000/users'); // Adjust the API URL
                
                // Filter users who have 'is_farmer' set to true
                const farmerUsers = response.data.filter(user => user.is_farmer === true);
                
                setUsers(farmerUsers); // Set filtered users
                setFilteredUsers(farmerUsers); // Initialize filteredUsers
            } catch (error) {
                console.error('Error fetching users:', error);
                setError('An error occurred while fetching users'); // Set error state
            } finally {
                setLoading(false); // Set loading to false once the request is complete
            }
        }

        fetchUsers();
    }, []); // Empty dependency array to run the effect once on mount

    const handleSearchChange = (event) => {
        const term = event.target.value.toLowerCase();
        setSearchTerm(term);

        // Filter users based on the search term
        const filtered = users.filter((user) =>
            user.name.toLowerCase().includes(term) || 
            user.surname.toLowerCase().includes(term)
        );
        setFilteredUsers(filtered);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }
    return (
        <div className={classes.FarmersPage}>
            <div className={classes.search}>
                <form className={classes.searchContainer} role="search">
                    <img
                        loading="lazy"
                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/39d3ffbacde2115b1f3ab9876df77e6f4cacb5d6b56a2314860468854d0f9fcd?placeholderIfAbsent=true&apiKey=e1ef14f8847548e5b6a397fcefa70042"
                        className={classes.searchIcon}
                        alt=""
                    />
                    <input
                        type="search"
                        id="farmerSearch"
                        className={classes.searchInput}
                        placeholder="Search user"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        aria-label="Search user"
                    />
                </form>
            </div>

            <div className={classes.PageTitle}>
                <p>Farmers</p>
            </div>

            {filteredUsers.length === 0 ? (
                <p>No farmer found.</p>
            ) : (
                <ul className={classes.UserComponent}>
                    {filteredUsers.map((user) => (
                        <li key={user.id} className={classes.userCompo}>
                            <div>
                                <img
                                    src="https://via.placeholder.com/296x184"
                                    alt="User Avatar"
                                />
                            </div>

                            <div className={classes.UserInfo}>
                                {user.name} <br />
                                {user.surname}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}