import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import classes from './CategoriesPage.module.css';

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
                    setCategories(response.data.Subcategories || []); // Fetch subcategories
                } else {
                    // For top-level categories, filter only parent categories (those without a parent)
                    const parentCategories = response.data.filter((cat) => !cat.parent_category_id);
                    setCategories(parentCategories);
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
                const parentCategories = response.data.filter((cat) => !cat.parent_category_id);
                setCategories(parentCategories);
            }
        } catch (err) {
            setError('Error adding category');
            console.error(err);
        }
    };

    const handleDeleteCategory = async () => {
        if (!id) return; // No category to delete if id is not provided

        try {
            await axios.delete(`http://localhost:3000/categories/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            setSuccessMessage('Category deleted successfully!');
            navigate('/categories'); // Redirect to the top-level categories after deletion
        } catch (err) {
            setError('Error deleting category');
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
        <div className={classes.CategoriesPage}>
            <div className={classes.PageTitle}>
                <p>Categories</p>
            </div>
            {id ? (
                <>
                    <p onClick={() => handleNavigate(parentCategory?.category_id)} className={classes.CategoryName}>
                        {parentCategory?.name}
                    </p>
                    <p>{parentCategory?.description}</p>
                    {categories.length > 0 ? (
                        categories.map((category) => (
                            <div key={category.category_id}>
                                <button
                                    onClick={() => handleNavigate(category.category_id)}
                                    className={classes.categoryButton}
                                >
                                    {category.name}
                                </button>
                                <div className={classes.separator}></div>
                            </div>
                        ))
                    ) : (
                        <p>No subcategories found</p>
                    )}

                    {/* Remove Current Category Button */}
                    {(userRole === 'Moderator' || userRole === 'Administrator') && (
                        <button
                            onClick={handleDeleteCategory}
                        >
                            Remove Current Category
                        </button>
                    )}
                </>
            ) : (
                categories.map((category) => (
                    <div key={category.category_id}>
                        <div className={classes.CategoryCompo}>
                            <p
                                onClick={() => handleNavigate(category.category_id)}
                                style={{cursor: 'pointer'}}
                                className={classes.CategoryName}
                            >
                                {category.name}
                            </p>
                            <div className={classes.SubcategoryCompo}>
                                {category.Subcategories?.map((sub) => (
                                    <div key={sub.category_id}>
                                        <button
                                            onClick={() => handleNavigate(sub.category_id)}
                                            className={classes.categoryButton}
                                        >
                                            <img
                                                src="https://via.placeholder.com/48x48"
                                                alt="User Avatar"
                                            />
                                            {sub.name}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className={classes.separator}></div>
                    </div>
                ))
            )}


            {(userRole === 'Moderator' || userRole === 'Administrator' || userRole === 'Registered User') && (
                <div>
                    <div className={classes.AddCompo}>
                        <button onClick={() => setShowForm(!showForm)} className={classes.categoryButton}>
                            <img
                                src="https://via.placeholder.com/48x48"
                                alt="User Avatar"
                            />
                            {showForm ? 'Cancel' : 'Add Category'}
                        </button>

                        {showForm && (
                            <div className={classes.AddInput}>
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
                    <div className={classes.separator}></div>
                </div>
            )}

            {successMessage && <p>{successMessage}</p>}
        </div>
    );
}
