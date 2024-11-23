//page of administrator to edit users 
import {useEffect, useState} from 'react';
import classes from "./EditUserListPage.module.css";
import {useNavigate} from "react-router-dom";
import api from '../../api';
import Edit_User from "../../assets/Edit_User.png";
import {jwtDecode} from 'jwt-decode';

export default function EditUserListPage() {
    const navigate = useNavigate();


    const handleNavigate = (path) => {
        navigate(path);
    };

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [filteredUsers, setFilteredUsers] = useState([]); 
    const [searchTerm, setSearchTerm] = useState('');
    const [farmer, setFarmer] = useState('');
    const [userRole, setUserRole] = useState(null);

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
                setError('Invalid token. Please log in again: ', err);
            }
        };

        checkAuthorization();
    }, );

    useEffect(() => {
        // Fetch users from the API using axios
        async function fetchUsers() {
            try {
                const response = await api.get('/users'); // Adjust the API URL
                setUsers(response.data);   
                setFilteredUsers(response.data); 
            } catch (error) {
                console.error('Error fetching users:', error);
                setError('An error occurred while fetching users');  // Set error state
            } finally {
                setLoading(false);  // Set loading to false once the request is complete
            }
        }

        fetchUsers();
    }, []);  // Empty dependency array to run the effect once on mount


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
        <div className={classes.EditUsersListPage}>

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


            <div className={classes.ManageUsers}>
                <div className={classes.Title}>
                    <p>Manage Users</p>
                </div>

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
                            id="userSearch"
                            className={classes.searchInput}
                            placeholder="Search user"
                            onChange={handleSearchChange}
                            aria-label="Search user"
                        />
                    </form>

                </div>

                <div>
                    {users.length === 0 ? (
                        <p>No users found.</p>
                    ) : (
                        <ul className={classes.UserComponent}>
                            <div className={classes.separator}></div>
                            {filteredUsers.map(user => (
                                <li key={user.id}>
                                    <div className={classes.userCompo}>
                                        <div className={classes.UserInfo}>
                                            {user.name} {user.surname}
                                        </div>
                                        <img
                                            src={Edit_User}
                                            alt="Edit User Icon"
                                            className={classes.icon}
                                            onClick={() => handleNavigate(`/editUser/${user.user_id}`)}
                                        />
                                    </div>
                                    <div className={classes.separator}></div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>


        </div>
    )
}