import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import classes from './CategoriesPage.module.css';

export default function CategoriesPage() {
    const { id } = useParams(); // Get the category ID from the URL params (if provided)
    const [categories, setCategories] = useState([]);
    const [parentCategory, setParentCategory] = useState([]);
    const [products, setProducts] = useState([]); // Products in the current category
    const [suggestedCategory, setSuggestedCategory] = useState([]);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [newCategory, setNewCategory] = useState({ name: '', description: '' });
    const [newProduct, setNewProduct] = useState({ name: '', description: '' }); // For product creation
    const [userRole, setUserRole] = useState(null);
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
                setUserRole(decodedToken.role); 
            } catch (err) {
                console.error('Error decoding token:', err);
            }
        };

        checkUserRole();
    }, []);

    // Fetch categories and products from the backend
    useEffect(() => {
        const fetchCategoryData = async () => {
            try {
                const response = await axios.get(
                    id
                        ? `http://localhost:3000/categories/${id}` // Fetch a single category and its children
                        : 'http://localhost:3000/categories' // Fetch all categories
                );
                const fetchedCategory = response.data;
                
                if (id) {
                
                    if (fetchedCategory.was_approved && !fetchedCategory.parent_category_id) {
                        setParentCategory(fetchedCategory);
                    } else {
                        setParentCategory(null);
                    }
                
                    // Subcategories: Separate approved and unapproved subcategories
                   
                    const approvedSubcategories = fetchedCategory.Subcategories?.filter(
                        (sub) => sub.was_approved
                    ) || [];
                    const unapprovedSubcategories = fetchedCategory.Subcategories?.filter(
                        (sub) => !sub.was_approved
                    ) || [];
                
                    // Set the categories and suggestedCategory
                    setCategories(approvedSubcategories);  // Subcategories with was_approved: true
                    setSuggestedCategory(unapprovedSubcategories);  // Subcategories with was_approved: false
                
                    // Fetch products for the category
                    const productResponse = await axios.get('http://localhost:3000/products');
                    const categoryProducts = productResponse.data.filter(
                        (product) => product.category_id === parseInt(id)
                    );
                    setProducts(categoryProducts);
                
                } else {
                    // When no `id` it is main
                    // const approvedParentCategories = fetchedCategory.filter(
                    //     (cat) => cat.was_approved && !cat.parent_category_id
                    // ) || [];
                    // const approvedParentCategories = response.data.filter(
                    //     (cat) => cat.was_approved && !cat.parent_category_id
                    // );
                
                    // // Filter out unapproved categories
                    // const unapprovedCategories = response.data.filter(
                    //     (cat) => !cat.was_approved && !cat.parent_category_id
                    // );

                   // setParentCategory(approvedParentCategories);
                
                    // Set the suggestedCategory (unapproved categories)
                    //setSuggestedCategory(unapprovedCategories);
                
                    // Fetch and set top-level parent categories (if needed)
                    const categoryResponse = await axios.get('http://localhost:3000/categories');
                    const parentCategories = categoryResponse.data.filter(
                        (cat) => !cat.parent_category_id && cat.was_approved
                    );
                    setCategories(parentCategories); 
                }
                
            } catch (err) {
                setError('Error fetching data');
                console.error(err);
            }
        };

        fetchCategoryData();
    }, [id]);

    const handleNavigate = (categoryId) => {
        navigate(`/categories/${categoryId}`); // Navigate to the child category page
    };

    const handleNavigateToProduct = (productId) => {
        navigate(`/products/${productId}`); // Navigate to the product details page
    };

    const handleAddCategory = async () => {
        try {
            const token = localStorage.getItem('token');
                if (!token) {
                    setError('User is not logged in');
                    return;
                }

                const decodedToken = jwtDecode(token);
                console.log('Decoded token:', decodedToken);
            const payload = {
                ...newCategory,
                parent_category_id: id || null,
                was_approved: decodedToken.role?.toLowerCase() === 'moderator' ? true : false, 
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

            window.location.reload();
        } catch (err) {
            setError('Error adding category');
            console.error(err);
        }
    };

    const handleAddProduct = async () => {
        try {
            const payload = {
                ...newProduct,
                category_id: id, // Associate the product with the current category
            };

            await axios.post('http://localhost:3000/products', payload, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            setSuccessMessage('Product added successfully!');
            setError('');
            setNewProduct({ name: '', description: '' });

            // Refresh products
            const productResponse = await axios.get('http://localhost:3000/products');
            const categoryProducts = productResponse.data.filter(
                (product) => product.category_id === parseInt(id)
            );
            setProducts(categoryProducts);
        } catch (err) {
            setError('Error adding product');
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

    const handleDeleteCategoryFromSuggested = async (id) => {
        if (!id) return; 

        try {
            await axios.delete(`http://localhost:3000/categories/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            setSuccessMessage('Category deleted successfully!');
            window.location.reload();
        } catch (err) {
            setError('Error deleting category');
            console.error(err);
        }
    };

    const handleApproveCategory = async (categoryId) => {
        try {

            await axios.put(
                `http://localhost:3000/categories/${categoryId}`,
                { was_approved: true },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );
            setSuccessMessage('Category approved successfully!');
    
            window.location.reload();
        } catch (error) {
            setError('Error approving category.');
            console.error(error);
        }
    };

    const handleInputChange = (e, form) => {
        const { name, value } = e.target;

        // Dynamically update the correct state
        if (form === 'category') {
            setNewCategory((prev) => ({
                ...prev,
                [name]: value,
            }));
        } else if (form === 'product') {
            setNewProduct((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const isLeafCategory = categories.length === 0; // Category has no subcategories
    console.log(categories);
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

                    {products.length > 0 && (
                        <>
                            <h2>Products</h2>
                            {products.map((product) => (
                                <p
                                    key={product.product_id}
                                    onClick={() => handleNavigateToProduct(product.product_id)}
                                    style={{ cursor: 'pointer', textDecoration: 'underline' }}
                                >
                                    {product.name}
                                </p>
                            ))}
                        </>
                    )}

                    {/* Add Product Button (for leaf categories only) */}
                    {isLeafCategory && (userRole === 'Moderator'
                        || userRole === 'Administrator'
                        || userRole === 'Registered User') && (
                        <div>
                            <h2>Add Product</h2>
                            <input
                                type="text"
                                name="name"
                                placeholder="Product Name"
                                value={newProduct.name}
                                onChange={(e) => handleInputChange(e, 'product')}
                            />
                            <input
                                type="text"
                                name="description"
                                placeholder="Product Description"
                                value={newProduct.description}
                                onChange={(e) => handleInputChange(e, 'product')}
                            />
                            <button onClick={handleAddProduct}>Add Product</button>
                        </div>
                    )}

                    {/* Remove Current Category Button (if no subcategories and no products) */}
                    {isLeafCategory &&
                        products.length === 0 &&
                        (userRole === 'Moderator' || userRole === 'Administrator') && (
                            <button
                                onClick={handleDeleteCategory}
                                className={classes.removeButton}
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
                            {category.Subcategories?.filter(
                                    (sub) => sub.was_approved === true || userRole === "Moderator" // Show unapproved categories only to Moderators
                                )
                                .map((sub) => (
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
                                            {!sub.was_approved && userRole === "Moderator" && (
                                                <span style={{ color: "red" }}> (Pending Approval)</span>
                                            )} 
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className={classes.separator}></div>
                    </div>
                ))
            )}


            {products.length === 0 && (userRole === 'Moderator'
                || userRole === 'Administrator'
                || userRole === 'Registered User') && (
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
                                    onChange={(e) => handleInputChange(e, 'category')}
                                />
                                <input
                                    type="text"
                                    name="description"
                                    placeholder="Category Description"
                                    value={newCategory.description}
                                    onChange={(e) => handleInputChange(e, 'category')}
                                />
                                <button onClick={handleAddCategory}>Submit</button>
                            </div>
                        )}
                    </div>
                    <div className={classes.separator}></div>
                </div>
            )}

            {userRole === 'Moderator' && suggestedCategory?.length > 0 && (
                <div className={classes.SuggestedCategories}>
                    <h3>Suggested Categories (Pending Approval)</h3>
                    <ul>
                        {suggestedCategory.map((category) => (
                            <li key={category.category_id} className={classes.CategoryItem}>
                                <div>
                                    <p><strong>Name:</strong> {category.name}</p>
                                    <p><strong>Description:</strong> {category.description}</p>
                                </div>
                                <button
                                    className={classes.ApproveButton}
                                    onClick={() => handleApproveCategory(category.category_id)}
                                >
                                    Approve
                                </button>
                                <button
                                    className={classes.DisapproveButton}
                                    onClick={() => handleDeleteCategoryFromSuggested(category.category_id)}
                                >
                                    Remove this Category
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {successMessage && <p>{successMessage}</p>}
        </div>
    );
}
