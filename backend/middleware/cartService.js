const cart = {}; // In-memory cart object

const addToCart = (user_id, offer_id, quantity) => {
    if (!cart[user_id]) {
        cart[user_id] = []; // Initialize cart for the user if not present
    }

    // Check if the item already exists in the cart
    const existingItem = cart[user_id].find((item) => item.offer_id === offer_id);
    if (existingItem) {
        existingItem.quantity += quantity; // Update quantity if item exists
    } else {
        cart[user_id].push({ offer_id, quantity }); // Add new item to cart
    }
};

const getCart = (user_id) => {
    return cart[user_id] || []; // Return user's cart or empty array
};

const clearCart = (user_id) => {
    delete cart[user_id]; // Clear the user's cart
};

// New function to remove a specific offer from the cart
const removeFromCart = (user_id, offer_id) => {
    if (cart[user_id]) {
        cart[user_id] = cart[user_id].filter((item) => item.offer_id !== offer_id); // Remove the offer
    }
};

module.exports = {
    addToCart,
    getCart,
    clearCart,
    removeFromCart, // Export the new function
};

