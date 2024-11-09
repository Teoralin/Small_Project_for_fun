// routes/moderatorRoutes.js
const express = require('express');
const { Moderator, User } = require('../models'); // Assuming Moderator and User models are imported

const router = express.Router();

// Create a new moderator
router.post('/', async (req, res) => {
    try {
        // Check if the user exists first
        const user = await User.findByPk(req.body.user_id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create the moderator and associate with the user
        const moderator = await Moderator.create({
            user_id: req.body.user_id,
        });

        res.status(201).json({ message: 'Moderator created successfully', moderator });
    } catch (error) {
        console.error('Error creating moderator:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get all moderators
router.get('/', async (req, res) => {
    try {
        const moderators = await Moderator.findAll({
            include: [User], // Include the associated user
        });
        res.status(200).json(moderators);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a single moderator by ID
router.get('/:id', async (req, res) => {
    try {
        const moderator = await Moderator.findByPk(req.params.id, {
            include: [User], // Include the associated user
        });

        if (moderator) {
            res.status(200).json(moderator);
        } else {
            res.status(404).json({ message: 'Moderator not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a moderator by ID
router.put('/:id', async (req, res) => {
    try {
        const moderator = await Moderator.findByPk(req.params.id);
        if (!moderator) {
            return res.status(404).json({ message: 'Moderator not found' });
        }

        // Optionally check if the user exists before updating (you can skip this if no changes to user)
        if (req.body.user_id) {
            const user = await User.findByPk(req.body.user_id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
        }

        await moderator.update(req.body);
        res.status(200).json({ message: 'Moderator updated successfully', moderator });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a moderator by ID
router.delete('/:id', async (req, res) => {
    try {
        const moderator = await Moderator.findByPk(req.params.id);
        if (!moderator) {
            return res.status(404).json({ message: 'Moderator not found' });
        }

        await moderator.destroy();
        res.status(200).json({ message: 'Moderator deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
