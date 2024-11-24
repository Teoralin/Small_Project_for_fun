import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api';
import {jwtDecode} from 'jwt-decode';
import classes from './CategoriesPage.module.css';
import Add from "../../assets/Add.png";

export default function CategoriesPage() {
    const { id } = useParams();
    const [categories, setCategories] = useState([]);
    const [parentCategory, setParentCategory] = useState([]);
    const [products, setProducts] = useState([]);
    const [suggestedCategory, setSuggestedCategory] = useState([]);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [newCategory, setNewCategory] = useState({ name: '', description: '' });
    const [newProduct, setNewProduct] = useState({ name: '', description: '' });
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showProductModal, setShowProductModal] = useState(false);  
    const [userRole, setUserRole] = useState(null);
    const [farmer, setFarmer] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkUserRole = () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setUserRole('');
                return;
            }

            try {
                const decodedToken = jwtDecode(token);
                if(decodedToken.is_farmer){
                    setFarmer('farmer');
                }
                setUserRole(decodedToken.role); 
            } catch (err) {
                console.error('Error decoding token:', err);
            }
        };

        checkUserRole();
    }, []);


    const fetchCategoryData = async () => {
        try {
            const response = await api.get(
                id
                    ? `/categories/${id}`
                    : '/categories'
            );
            const fetchedCategory = response.data;
            
            if (id) {
            
                if (fetchedCategory.was_approved && !fetchedCategory.parent_category_id) {
                    setParentCategory(fetchedCategory);
                } else {
                    setParentCategory(null);
                }
               
                const approvedSubcategories = fetchedCategory.Subcategories?.filter(
                    (sub) => sub.was_approved
                ) || [];
                const unapprovedSubcategories = fetchedCategory.Subcategories?.filter(
                    (sub) => !sub.was_approved
                ) || [];
            
                setCategories(approvedSubcategories);  
                setSuggestedCategory(unapprovedSubcategories);  
            
                const productResponse = await api.get('/products');
                const categoryProducts = productResponse.data.filter(
                    (product) => product.category_id === parseInt(id)
                );
                setProducts(categoryProducts);
            
            } else {

                const unapprovedCategories = response.data.filter(
                    (cat) => !cat.was_approved && !cat.parent_category_id
                );

                setSuggestedCategory(unapprovedCategories);
            
                const categoryResponse = await api.get('/categories');
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

    useEffect(() => {
        fetchCategoryData();
    }, [id]);


    const handleNavigate = (categoryId) => {
        navigate(`/categories/${categoryId}`);
    };

    const handleNavigateToProduct = (productId) => {
        navigate(`/products/${productId}`); 
    };


    const handleAddCategory = async () => {
        if (!newCategory.name.trim()) {
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
            const payload = {
                ...newCategory,
                parent_category_id: id || null,
                was_approved: decodedToken.role?.toLowerCase() === 'moderator' || decodedToken.role?.toLowerCase() === 'administrator',
            };

            const response = await api.post('/categories', payload);
            await fetchCategoryData();
            if(response.was_approved){
                setSuccessMessage('Category added successfully!')
            }else{
                setSuccessMessage('Category suggested! Wait for approval');
            }

            setError('');
            setShowCategoryModal(false);
            setNewCategory({ name: '', description: '' });
        } catch (err) {
            setError('Error adding category');
            console.error(err);
        }
    };

    const handleAddProduct = async () => {
        if (!newProduct.name.trim()) {
            setSuccessMessage('Product must have a name!');
            return;
        }

        try {
            const payload = {
                ...newProduct,
                category_id: id,
            };

            const response = await api.post('/products', payload);

            setProducts((prevProducts) => [...prevProducts, response.data]);

            await fetchCategoryData();
            setSuccessMessage('Product added successfully!');
            setError('');
            setShowProductModal(false);
            setNewProduct({ name: '', description: '' });
        } catch (err) {
            console.error('Error adding product:', err);
            setError('Error adding product. Please try again.');
        }
    };



    const handleDeleteCategory = async () => {
        if (!id) return;

        try {
            await api.delete(`/categories/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            setSuccessMessage('Category deleted successfully!');
            navigate('/categories');
        } catch (err) {
            setError('Error deleting category');
            console.error(err);
        }
    };

    const handleDeleteCategoryFromSuggested = async (id) => {
        if (!id) return; 

        try {
            await api.delete(`/categories/${id}`, {
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

            await api.put(
                `/categories/${categoryId}`,
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


    const isLeafCategory = categories.length === 0;
    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className={classes.CategoriesPage}>
            {id ? (
                <>
                    <div>
                        <p onClick={() => handleNavigate(parentCategory?.category_id)} className={classes.CategoryName2}>
                            {parentCategory?.name}
                        </p>
                        <p className={classes.CategoryDescription} >{parentCategory?.description}</p>

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
                        || farmer === 'farmer') && (
                        <div>
                            {!showForm && (

                                <div className={classes.AddCompo}>

                                    <button onClick={() => setShowProductModal(true)} className={classes.categoryButton}>
                                        <div
                                            className={classes.TitleAdd}>
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

                            {showProductModal && (
                                <div className={classes.Modal}>
                                    <div className={classes.ModalContent}>
                                        <h2>Add New Product</h2>
                                        <input
                                            type="text"
                                            placeholder="Product Name"
                                            value={newProduct.name}
                                            onChange={(e) => setNewProduct((prev) => ({ ...prev, name: e.target.value }))}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Product Description"
                                            value={newProduct.description}
                                            onChange={(e) => setNewProduct((prev) => ({ ...prev, description: e.target.value }))}
                                        />
                                        <div className={classes.ModalButtons}>
                                            <button onClick={() => setShowProductModal(false)} className={classes.DisapproveButton}>Cancel</button>
                                            <button onClick={handleAddProduct} className={classes.ApproveButton}>Submit</button>
                                        </div>
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
                                    (sub) => sub.was_approved === true || userRole === "Moderator"  || userRole === "Administrator"
                                ).length > 0 ? (
                                    <div className={classes.ProductsList}>
                                        {category.Subcategories.filter(
                                            (sub) => sub.was_approved === true || userRole === "Moderator" || userRole === "Administrator"
                                        ).map((sub) => (
                                            <div key={sub.category_id} className={classes.SubcategoriesList}>
                                                <p
                                                    onClick={() => handleNavigate(sub.category_id)}
                                                    className={classes.ProductText}
                                                >
                                                    {sub.name}
                                                    {!sub.was_approved && (userRole === "Moderator" || userRole === "Administrator") && (
                                                        <span style={{color: "red"}}> (Pending Approval)</span>
                                                    )}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className={classes.NoSubcategoriesFound}>No subcategories found</p>
                                )}
                            </div>

                        </div>
                        <div className={classes.separator}></div>
                    </div>
                ))
            )}


            {products.length === 0 && (userRole === 'Moderator'
                || userRole === 'Administrator') && (
                <div>
                    {!showForm && (
                    <div className={classes.AddCompo}>
                            <button onClick={() => setShowCategoryModal(true)} className={classes.categoryButton}>
                                <div className={classes.TitleAdd}>
                                    <img
                                        src={Add}
                                        alt="Add Icon"
                                        className={classes.icon}
                                    />
                                    Add category
                                 
                                </div>
                            </button>
                        </div>
                    )}
                    {showCategoryModal && (
                        <div className={classes.Modal}>
                            <div className={classes.ModalContent}>
                                <h2>Add New Category</h2>
                                <input
                                    type="text"
                                    placeholder="Category Name"
                                    value={newCategory.name}
                                    onChange={(e) => setNewCategory((prev) => ({ ...prev, name: e.target.value }))}
                                />
                                <input
                                    type="text"
                                    placeholder="Category Description"
                                    value={newCategory.description}
                                    onChange={(e) => setNewCategory((prev) => ({ ...prev, description: e.target.value }))}
                                />
                                <div className={classes.ModalButtons}>
                                    <button onClick={() => setShowCategoryModal(false)} className={classes.DisapproveButton}>Cancel</button>
                                    <button onClick={handleAddCategory} className={classes.ApproveButton}>Submit</button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className={classes.separator}></div>
                </div>
            )}

            {(userRole === 'Moderator' || userRole === "Administrator") && suggestedCategory?.length > 0 && (
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
