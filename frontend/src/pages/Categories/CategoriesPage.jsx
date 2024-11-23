import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import classes from './CategoriesPage.module.css';
import Add from "../../assets/Add.png";

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
        if (!newCategory.name || newCategory.name.trim() === '') {
            setNewCategory({ name: '', description: '' });
            setSuccessMessage('Category must have a name!');
            return;
        }
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
        // Validation for product name
        if (!newProduct.name || newProduct.name.trim() === '') {
            setNewProduct({ name: '', description: '' });
            setSuccessMessage('Product must have a name!');
            return;
        }

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

            // Clear inputs and reset states after success
            setNewProduct({ name: '', description: '' });
            setError(''); // Clear any existing errors
            setSuccessMessage('Product added successfully!');
        } catch (err) {
            console.error('Error adding product:', err);
            setError('Error adding product. Please try again.');
        }
    };



    const handleDeleteCategory = async () => {
        if (!id) return;

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

    const isLeafCategory = categories.length === 0;
    console.log(categories);
    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className={classes.CategoriesPage}>
            {id ? (
                <>
                    <div>
                        {/* Отображаем имя родительской категории */}
                        <p onClick={() => handleNavigate(parentCategory?.category_id)} className={classes.CategoryName}>
                            {parentCategory?.name}
                        </p>
                        <p className={classes.CategoryDescription}>{parentCategory?.description}</p>

                        {/* Отображаем подкатегории */}
                        {categories.length > 0 && (
                            <div className={classes.ProductsList}>
                                {categories.map((category) => (
                                    <div key={category.category_id} className={classes.SubcategoriesList}>
                                        <button
                                            onClick={() => handleNavigate(category.category_id)}
                                            className={classes.categoryButton}
                                        >
                                            {category.name}
                                        </button>

                                    </div>
                                ))}
                            </div>
                        )}
                    </div>


                    {isLeafCategory && (userRole === 'Moderator'
                        || userRole === 'Administrator'
                        || userRole === 'Registered User') && (
                        <div>
                            {!showForm && (

                                <div className={classes.AddCompo}>

                                    <button onClick={() => setShowForm(true)} className={classes.categoryButton}>
                                        <div
                                            className={classes.TitleAdd}> {/* Используем TitleCategory как у продуктов */}
                                            <img
                                                src={Add}
                                                alt="Add Icon"
                                                className={classes.icon}
                                            />
                                            Add Product
                                        </div>
                                    </button>
                                </div>
                            )}

                            {/* Форма для заполнения */}
                            {showForm && (
                                <div className={classes.AddInput}>
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
                                    <div className={classes.FormButtons}>
                                        {/* Кнопка Cancel для закрытия формы */}
                                        <button onClick={() => setShowForm(false)}>Cancel</button>
                                        {/* Кнопка Submit для отправки формы */}
                                        <button onClick={handleAddProduct}>Submit</button>
                                    </div>
                                </div>
                            )}

                            <div className={classes.separator}></div>
                        </div>
                    )}


                    <div>

                        {products.length > 0 ? (
                            <>
                                <div className={classes.ProductsList}>
                                    {products.map((product) => (
                                        <div key={product.product_id} className={classes.Products}>
                                            <p
                                                onClick={() => handleNavigateToProduct(product.product_id)}
                                                className={classes.ProductText}
                                            >
                                                {product.name}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (

                            <p className={classes.NoProductsFound}>No products found</p>
                            )}
                        <div className={classes.separator}></div>
                    </div>

                    {isLeafCategory &&
                        products.length === 0 &&
                        (userRole === 'Moderator' || userRole === 'Administrator') && (
                            <button
                                onClick={handleDeleteCategory}
                                className={classes.removeButton}
                            >
                                Remove Current Category
                            </button>
                        )
                    }
                </>
            ) : (

                categories.map((category, index) => (
                    <div key={category.category_id}>
                        {index === 0 && <div className={classes.PageTitle}>Categories</div>}

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
                                    (sub) => sub.was_approved === true || userRole === "Moderator"  // Показываем неподтвержденные категории только для Модераторов
                                ).length > 0 ? (
                                    <div className={classes.ProductsList}>
                                        {category.Subcategories.filter(
                                            (sub) => sub.was_approved === true || userRole === "Moderator"
                                        ).map((sub) => (
                                            <div key={sub.category_id} className={classes.SubcategoriesList}>
                                                <p
                                                    onClick={() => handleNavigate(sub.category_id)}
                                                    className={classes.ProductText}
                                                >
                                                    {sub.name}
                                                    {!sub.was_approved && userRole === "Moderator" && (
                                                        <span style={{color: "red"}}> (Pending Approval)</span>
                                                    )}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className={classes.NosubcategoriesFound}>No subcategories found</p>
                                )}
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
                    {!showForm && (
                        <div className={classes.AddCompo}>
                            <button onClick={() => setShowForm(!showForm)} className={classes.categoryButton}>
                                <div className={classes.TitleAdd}> {/* Используем TitleCategory как у продуктов */}
                                    <img
                                        src={Add}
                                        alt="Add Icon"
                                        className={classes.icon}
                                    />
                                    {showForm ? null : 'Add Category'}
                                </div>
                            </button>
                        </div>
                    )}

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
                            <div className={classes.FormButtons}>
                                <button onClick={() => setShowForm(false)}>Cancel</button>
                                <button onClick={handleAddCategory}>Submit</button>
                            </div>
                        </div>
                    )}

                    <div className={classes.separator}></div>
                </div>
            )}

            {userRole === 'Moderator' && suggestedCategory?.length > 0 && (
                <div className={classes.SuggestedCategories}>
                    <p className={classes.SectionTitle}>Suggested Categories (Pending Approval)</p>
                    <ul className={classes.CategoryList}>
                        {suggestedCategory.map((category) => (
                            <li key={category.category_id} className={classes.CategoryItem}>
                                <div className={classes.CategoryDetails}>
                                    <p>Name: {category.name}</p>
                                    <p>Description: {category.description}</p>
                                </div>
                                <div className={classes.ButtonsContainer}>
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
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}


            {successMessage && <p>{successMessage}</p>}
        </div>
    );
}
