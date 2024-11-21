import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';

export default function CategoriesPage() {
    const { id } = useParams(); // Get the category ID from the URL params (if provided)
    const [categories, setCategories] = useState([]);
    const [parentCategory, setParentCategory] = useState(null);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [newCategory, setNewCategory] = useState({ name: '', description: '' });
    const [userRole, setUserRole] = useState('');
    const navigate = useNavigate();

    // Check the user's role
    useEffect(() => {
        const checkUserRole = () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setUserRole('');
                return;
            }

            try {
                const decodedToken = jwtDecode(token);
                setUserRole(decodedToken.role); // Extract role from the token
            } catch (err) {
                console.error('Error decoding token:', err);
            }
        };

        checkUserRole();
    }, []);

    // Fetch categories from the backend
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(
                    id
                        ? `http://localhost:3000/categories/${id}` // Fetch a single category and its children
                        : 'http://localhost:3000/categories' // Fetch all categories
                );

                if (id) {
                    setParentCategory(response.data);
                    setCategories(response.data.Subcategories || []);
                } else {
                    setCategories(response.data.filter((cat) => !cat.parent_category_id));
                }
            } catch (err) {
                setError('Error fetching categories');
                console.error(err);
            }
        };

        fetchCategories();
    }, [id]);

    const handleNavigate = (categoryId) => {
        navigate(`/categories/${categoryId}`); // Navigate to the child category page
    };

    const handleAddCategory = async () => {
        try {
            const payload = {
                ...newCategory,
                parent_category_id: id || null, // Use parent category ID if on a subcategory page
            };

            await axios.post('http://localhost:3000/categories', payload, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            setSuccessMessage('Category added successfully!');
            setError('');
            setShowForm(false);
            setNewCategory({ name: '', description: '' });

            // Refresh categories
            const response = await axios.get(
                id
                    ? `http://localhost:3000/categories/${id}`
                    : 'http://localhost:3000/categories'
            );
            if (id) {
                setCategories(response.data.Subcategories || []);
            } else {
                setCategories(response.data.filter((cat) => !cat.parent_category_id));
            }
        } catch (err) {
            setError('Error adding category');
            console.error(err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewCategory((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            {id ? (
                // If viewing a specific category, show its name and subcategories
                <>
                    <h1 onClick={() => handleNavigate(parentCategory?.category_id)}>
                        {parentCategory?.name}
                    </h1>
                    <p>{parentCategory?.description}</p>
                    {categories.length > 0 ? (
                        categories.map((category) => (
                            <h1
                                key={category.category_id}
                                onClick={() => handleNavigate(category.category_id)}
                                style={{ cursor: 'pointer' }} // Make it clear the h1 is clickable
                            >
                                {category.name}
                            </h1>
                        ))
                    ) : (
                        <p>No subcategories found</p>
                    )}
                </>
            ) : (
                // If viewing the top-level categories, list all parent categories
                categories.map((category) => (
                    <div key={category.category_id}>
                        <h1
                            onClick={() => handleNavigate(category.category_id)}
                            style={{ cursor: 'pointer' }} // Make it clear the h1 is clickable
                        >
                            {category.name}
                        </h1>
                        {category.Subcategories?.map((sub) => (
                            <button
                                key={sub.category_id}
                                onClick={() => handleNavigate(sub.category_id)}
                            >
                                {sub.name}
                            </button>
                        ))}
                    </div>
                ))
            )}

            {/* Add Category Button (only for Moderators or Administrators) */}
            {(userRole === 'Moderator' || userRole === 'Administrator') && (
                <div>
                    <button onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : 'Add Category'}
                    </button>

                    {showForm && (
                        <div>
                            <input
                                type="text"
                                name="name"
                                placeholder="Category Name"
                                value={newCategory.name}
                                onChange={handleInputChange}
                            />
                            <input
                                type="text"
                                name="description"
                                placeholder="Category Description"
                                value={newCategory.description}
                                onChange={handleInputChange}
                            />
                            <button onClick={handleAddCategory}>Submit</button>
                        </div>
                    )}
                </div>
            )}

            {successMessage && <p>{successMessage}</p>}
        </div>
    );
}
