const express = require('express');
const { Offer } = require('../models');
const { addToCart, getCart, clearCart, removeFromCart } = require('../middleware/cartService')
const {jwtDecode} = require('jwt-decode');

const router = express.Router();

router.post('/add', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const { userId } = jwtDecode(token);
        const { offer_id, quantity } = req.body;

        const offer = await Offer.findByPk(offer_id);
        if (!offer) {
            return res.status(404).json({ message: 'Offer not found' });
        }
        if (quantity > offer.quantity) {
            return res.status(400).json({ message: 'Requested quantity exceeds available stock' });
        }

        addToCart(userId, offer_id, quantity);

        res.status(200).json({ message: 'Item added to cart successfully' });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/', (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const { userId } = jwtDecode(token);

        const userCart = getCart(userId);
        res.status(200).json(userCart);
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ error: error.message });
    }
});

router.delete('/clear', (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const { userId } = jwtDecode(token);

        clearCart(userId);
        res.status(200).json({ message: 'Cart cleared successfully' });
    } catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:offer_id', (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const { userId } = jwtDecode(token);
        const { offer_id } = req.params;

        removeFromCart(userId, parseInt(offer_id));
        res.status(200).json({ message: 'Item removed from cart successfully' });
    } catch (error) {
        console.error('Error removing item from cart:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
