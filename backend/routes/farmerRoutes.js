// routes/farmerRoutes.js
const express = require('express');
const { Farmer, User } = require('../models'); 

const router = express.Router();

// Create a new farmer
router.post('/', async (req, res) => {
    try {
        const dUser = await User.findByPk(req.body.user_id);
        if (!User) {
            return res.status(404).json({ message: 'User not found' });
        }

        const farmer = await Farmer.create({
            user_id: req.body.user_id,
        });

        res.status(201).json({ message: 'Farmer created successfully', farmer });
    } catch (error) {
        console.error('Error creating farmer:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get all farmers
router.get('/', async (req, res) => {
    try {
        const farmers = await Farmer.findAll({
            include: [{
                model: User,
                as: 'User', 
            }]
        });
        res.status(200).json(farmers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a single farmer by ID
router.get('/:id', async (req, res) => {
    try {
        const farmer = await Farmer.findByPk(req.params.id, {
            include: [{
                model: User,
                as: 'User', 
            }]
        });

        if (farmer) {
            res.status(200).json(farmer);
        } else {
            res.status(404).json({ message: 'Farmer not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a farmer by ID
router.put('/:id', async (req, res) => {
    try {
        const farmer = await Farmer.findByPk(req.params.id);
        if (!farmer) {
            return res.status(404).json({ message: 'Farmer not found' });
        }

        if (req.body.user_id) {
            const User = await User.findByPk(req.body.user_id);
            if (!User) {
                return res.status(404).json({ message: 'User not found' });
            }
        }

        await farmer.update(req.body);
        res.status(200).json({ message: 'Farmer updated successfully', farmer });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a farmer by ID
router.delete('/:id', async (req, res) => {
    try {
        const farmer = await Farmer.findByPk(req.params.id);
        if (!farmer) {
            return res.status(404).json({ message: 'Farmer not found' });
        }

        await farmer.destroy();
        res.status(200).json({ message: 'Farmer deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
