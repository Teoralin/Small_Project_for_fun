const express = require('express');
const { Offer, Product, User } = require('../models');

const router = express.Router();

// Create a new offer
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

// Retrieve all offers with product and farmer details
router.get('/', async (req, res) => {
    try {
        const offers = await Offer.findAll({
            include: [
                { model: Product, attributes: ['name', 'description'] },
                { model: User, attributes: ['user_id'] }, // Adjust attributes as needed
            ],
        });

        res.status(200).json(offers);
    } catch (error) {
        console.error('Error retrieving offers:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/:user_id', async (req, res) => {
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

// Retrieve a specific offer by product_id and user_id
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

// Retrieve a specific offer by offer_id
router.get('/:offer_id', async (req, res) => {
    try {
        const { offer_id } = req.params;

        const offer = await Offer.findOne({
            where: { offer_id },
            include: [
                {
                    model: Product,
                    attributes: ['name', 'description'], // Include product details
                },
                {
                    model: User,
                    as: 'User',
                    attributes: ['user_id'], // Include user details (if needed)
                },
            ],
        });

        if (offer) {
            res.status(200).json(offer); // Send the offer details as a response
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

        // Find the offer by its ID
        const offer = await Offer.findByPk(offer_id);

        if (offer) {
            // Update the offer properties
            const updatedOffer = await offer.update({
                price: req.body.price !== undefined ? req.body.price : offer.price,
                quantity: req.body.quantity !== undefined ? req.body.quantity : offer.quantity,
                status: req.body.status || offer.status,
                is_pickable: req.body.is_pickable !== undefined ? req.body.is_pickable : offer.is_pickable,
            });

            // Respond with the updated offer
            res.status(200).json({ message: 'Offer updated successfully', updatedOffer });
        } else {
            // Offer not found
            res.status(404).json({ message: 'Offer not found' });
        }
    } catch (error) {
        console.error('Error updating offer:', error);
        res.status(500).json({ error: error.message });
    }
});
// Update an offer by product_id and user_id
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

// Delete an offer by product_id and user_id
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
