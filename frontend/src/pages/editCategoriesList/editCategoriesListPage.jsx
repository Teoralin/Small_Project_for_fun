import React, {useEffect, useState} from 'react';
import classes from "./EditCategoriesListPage.module.css";
import {useNavigate} from "react-router-dom";
import axios from "axios";
//import Edit_User from "../../assets/Edit_User.png";
import {jwtDecode} from 'jwt-decode';

export default function EditUserListPage() {
    const navigate = useNavigate();


    const handleNavigate = (path) => {
        navigate(path);
    };

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [filteredCategories, setFilteredCategories] = useState([]); 
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const checkAuthorization = () => {
            const token = localStorage.getItem('token');

            if (!token) {
                setError('Access denied. Please log in.');
                return;
            }

            try {
                const decodedToken = jwtDecode(token);
                if (decodedToken.role !== 'Moderator') {
                    setError('Access denied. Insufficient permissions.');
                } else {
                    setIsAuthorized(true); 
                }
            } catch (err) {
                setError('Invalid token. Please log in again.');
            }
        };

        checkAuthorization();
    }, );

    useEffect(() => {
        // Fetch users from the API using axios
        async function fetchCategories() {
            try {
                const response = await axios.get('http://localhost:3000/categories'); // Adjust the API URL
                setCategories(response.data);   
                setFilteredCategories(response.data); 
            } catch (error) {
                console.error('Error fetching categories:', error);
                setError('An error occurred while fetching categories');  // Set error state
            } finally {
                setLoading(false);  // Set loading to false once the request is complete
            }
        }

        fetchCategories();
    }, []);  // Empty dependency array to run the effect once on mount


    const handleSearchChange = (event) => {
        const term = event.target.value.toLowerCase();
        setSearchTerm(term);

        // Filter users based on the search term
        const filtered = categories.filter((categories) =>
            categories.name.toLowerCase().includes(term)
        );
        setFilteredCategories(filtered);
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
                <button type="Option"
                        className={classes.OptionButton}
                        onClick={() => handleNavigate('/offersList')}
                >
                    Offers
                </button>
                <button type="Option"
                        className={classes.OptionButtonSelected}
                >
                    Manage Categories
                </button>
            </div>


            <div className={classes.ManageUsers}>
                <div className={classes.Title}>
                    <p>Manage Categories</p>
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
                            id="categorySearch"
                            className={classes.searchInput}
                            placeholder="Search category"
                            onChange={handleSearchChange}
                            aria-label="Search category"
                        />
                    </form>

                    <button type="search" className={classes.SearchButton}>
                        Search
                    </button>

                </div>

                <div>
                    {categories.length === 0 ? (
                        <p>No category found.</p>
                    ) : (
                        <ul className={classes.UserComponent}>
                            <div className={classes.separator}></div>
                            {filteredCategories.map(category => (
                                <li key={category.id}>
                                    <div className={classes.userCompo}>
                                        <div className={classes.UserInfo}>
                                            {category.name}
                                        </div>
          
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