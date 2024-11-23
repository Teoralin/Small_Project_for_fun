import { useState, useEffect } from 'react';
import classes from './UsersPage.module.css';
import api from '../../api.jsx'

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [scrollPosition, setScrollPosition] = useState(0);

    useEffect(() => {
        async function fetchUsers() {
            try {
                const response = await api.get('/users');
                setUsers(response.data);
                setFilteredUsers(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
                setError('An error occurred while fetching users');
            } finally {
                setLoading(false);
            }
        }

        fetchUsers();
    }, []);

    const handleSearchChange = (event) => {
        const term = event.target.value.toLowerCase();
        setSearchTerm(term);

        const filtered = users.filter((user) =>
            user.name.toLowerCase().includes(term) ||
            user.surname.toLowerCase().includes(term)
        );
        setFilteredUsers(filtered);
    };

    const handleScrollLeft = () => {
        setScrollPosition(scrollPosition - 300);  // Прокручиваем влево
    };

    const handleScrollRight = () => {
        setScrollPosition(scrollPosition + 300);  // Прокручиваем вправо
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className={classes.userPage}>
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
                        value={searchTerm}
                        onChange={handleSearchChange}
                        aria-label="Search user"
                    />
                </form>
            </div>

            <div className={classes.PageTitle}>
                <p>Users</p>
            </div>

            {filteredUsers.length === 0 ? (
                <p>No users found.</p>
            ) : (
                <div className={classes.scrollContainer}>
                    <button
                        onClick={handleScrollLeft}
                        className={classes.scrollButton}
                        disabled={scrollPosition <= 0}
                    >
                        &#8592; {/* Стрелка влево */}
                    </button>
                    <ul
                        className={classes.UserComponent}
                        style={{ transform: `translateX(-${scrollPosition}px)` }}
                    >
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
                    <button
                        onClick={handleScrollRight}
                        className={classes.scrollButton}
                        disabled={scrollPosition >= (filteredUsers.length - 5) * 300}
                    >
                        &#8594; {/* Стрелка вправо */}
                    </button>
                </div>
            )}
        </div>
    );
}
