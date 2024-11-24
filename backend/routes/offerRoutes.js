const express = require('express');
const { Offer, Product, User } = require('../models');

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { product_id, user_id, price, quantity, status, is_pickable } = req.body;

        const offer = await Offer.create({
            product_id,
            user_id,
            price,
            quantity,
            status,
            is_pickable: is_pickable || false,
        });

        res.status(201).json({ message: 'Offer created successfully', offer });
    } catch (error) {
        console.error('Error creating offer:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const offers = await Offer.findAll({
            include: [
                { model: Product, attributes: ['name', 'description'] },
                { model: User, attributes: ['user_id'] },
            ],
        });

        res.status(200).json(offers);
    } catch (error) {
        console.error('Error retrieving offers:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get offers filtered by product_id
router.get('/product/:product_id', async (req, res) => {
    try {
        const { product_id } = req.params;

        // Find all offers with the given product_id
        const offers = await Offer.findAll({
            where: { product_id },
            include: [
                { model: Product, attributes: ['name', 'description'] }, // Include product details
                { model: User, attributes: ['user_id'] }, // Include user details
            ],
        });
        res.status(200).json(offers);
    } catch (error) {
        console.error('Error retrieving offers by product_id:', error);
        res.status(500).json({ error: error.message });
    }
});


router.get('/user/:user_id', async (req, res) => {
    try {
        const { user_id } = req.params;

        const offer = await Offer.findAll({
            where: { user_id },
            include: [
                { model: Product, attributes: ['name', 'description'] },
            ],
        });

        if (offer) {
            res.status(200).json(offer);
        } else {
            res.status(404).json({ message: 'Offer not found' });
        }
    } catch (error) {
        console.error('Error retrieving offer:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/:product_id/:user_id', async (req, res) => {
    try {
        const { product_id, user_id } = req.params;

        const offer = await Offer.findOne({
            where: { product_id, user_id },
            include: [
                { model: Product, attributes: ['name', 'description'] },
                { model: User, attributes: ['user_id'] },
            ],
        });

        if (offer) {
            res.status(200).json(offer);
        } else {
            res.status(404).json({ message: 'Offer not found' });
        }
    } catch (error) {
        console.error('Error retrieving offer:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/:offer_id', async (req, res) => {
    try {
        const { offer_id } = req.params;

        const offer = await Offer.findOne({
            where: { offer_id },
            include: [
                {
                    model: Product,
                    attributes: ['name', 'description'],
                },
                {
                    model: User,
                    as: 'User',
                    attributes: ['user_id'],
                },
            ],
        });

        if (offer) {
            res.status(200).json(offer);
        } else {
            res.status(404).json({ message: 'Offer not found' });
        }
    } catch (error) {
        console.error('Error retrieving offer:', error);
        res.status(500).json({ error: error.message });
    }
});

router.put('/:offer_id', async (req, res) => {
    try {
        const { offer_id } = req.params;

        const offer = await Offer.findByPk(offer_id);

        if (offer) {
            const updatedOffer = await offer.update({
                price: req.body.price !== undefined ? req.body.price : offer.price,
                quantity: req.body.quantity !== undefined ? req.body.quantity : offer.quantity,
                status: req.body.status || offer.status,
                is_pickable: req.body.is_pickable !== undefined ? req.body.is_pickable : offer.is_pickable,
            });

            res.status(200).json({ message: 'Offer updated successfully', updatedOffer });
        } else {
            res.status(404).json({ message: 'Offer not found' });
        }
    } catch (error) {
        console.error('Error updating offer:', error);
        res.status(500).json({ error: error.message });
    }
});
router.put('/:product_id/:user_id', async (req, res) => {
    try {
        const { product_id, user_id } = req.params;

        const offer = await Offer.findOne({ where: { product_id, user_id } });

        if (offer) {
            const updatedOffer = await offer.update({
                price: req.body.price || offer.price,
                quantity: req.body.quantity || offer.quantity,
                status: req.body.status || offer.status,
                is_pickable: req.body.is_pickable !== undefined ? req.body.is_pickable : offer.is_pickable,
            });

            res.status(200).json({ message: 'Offer updated successfully', updatedOffer });
        } else {
            res.status(404).json({ message: 'Offer not found' });
        }
    } catch (error) {
        console.error('Error updating offer:', error);
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:product_id/:user_id', async (req, res) => {
    try {
        const { product_id, user_id } = req.params;

        const offer = await Offer.findOne({ where: { product_id, user_id } });

        if (offer) {
            await offer.destroy();
            res.status(200).json({ message: 'Offer deleted successfully' });
        } else {
            res.status(404).json({ message: 'Offer not found' });
        }
    } catch (error) {
        console.error('Error deleting offer:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
