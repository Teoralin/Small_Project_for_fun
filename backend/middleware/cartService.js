const cart = {};

const addToCart = (user_id, offer_id, quantity) => {
    if (!cart[user_id]) {
        cart[user_id] = [];
    }

    const existingItem = cart[user_id].find((item) => item.offer_id === offer_id);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart[user_id].push({ offer_id, quantity });
    }
};

const getCart = (user_id) => {
    return cart[user_id] || [];
};

const clearCart = (user_id) => {
    delete cart[user_id];
};

const removeFromCart = (user_id, offer_id) => {
    if (cart[user_id]) {
        cart[user_id] = cart[user_id].filter((item) => item.offer_id !== offer_id);
    }
};

module.exports = {
    addToCart,
    getCart,
    clearCart,
    removeFromCart,
};

