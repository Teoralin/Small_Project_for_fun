const express = require('express');
const bcrypt = require('bcrypt');
const { Administrator, User } = require('../models');

const router = express.Router();

// Create a new Administrator (user is created first, then administrator is associated)
router.post('/', async (req, res) => {
    try {
        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Create the User first
        const user = await User.create({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            name: req.body.name,
            contact_info: req.body.contact_info,
            role: 'Administrator',  // Set the role as Administrator
        });

        // Create the associated Administrator record
        const administrator = await Administrator.create({
            user_id: user.user_id,  // Associate the new user with the Administrator model
        });

        res.status(201).json({ message: 'Administrator created successfully', administrator });
    } catch (error) {
        console.error('Error creating administrator:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get all Administrators (including User details but excluding password)
router.get('/', async (req, res) => {
    try {
        const administrators = await Administrator.findAll({
            include: [User],  // Include associated User data
            attributes: { exclude: ['password'] },  // Exclude the password from response
        });

        res.status(200).json(administrators);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a single Administrator by ID
router.get('/:id', async (req, res) => {
    try {
        const administrator = await Administrator.findOne({
            where: { user_id: req.params.id },
            include: [User],  // Include associated User data
            attributes: { exclude: ['password'] },  // Exclude password
        });

        if (administrator) {
            res.status(200).json(administrator);
        } else {
            res.status(404).json({ message: 'Administrator not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update an Administrator's information by ID
router.put('/:id', async (req, res) => {
    try {
        const administrator = await Administrator.findOne({
            where: { user_id: req.params.id },
        });

        if (administrator) {
            const user = await User.findByPk(administrator.user_id);
            if (user) {
                // If the password is being updated, hash it before saving
                if (req.body.password) {
                    req.body.password = await bcrypt.hash(req.body.password, 10);
                }

                // Update the user details
                await user.update(req.body);

                // Optionally update the administrator details as well
                await administrator.update(req.body);  // Update any administrator-specific fields

                res.status(200).json({ message: 'Administrator updated successfully', administrator });
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        } else {
            res.status(404).json({ message: 'Administrator not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete an Administrator by ID
router.delete('/:id', async (req, res) => {
    try {
        const administrator = await Administrator.findOne({
            where: { user_id: req.params.id },
        });

        if (administrator) {
            const user = await User.findByPk(administrator.user_id);
            if (user) {
                // Delete the associated user record
                await user.destroy();

                // Optionally delete the administrator record
                await administrator.destroy();

                res.status(200).json({ message: 'Administrator and User deleted successfully' });
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        } else {
            res.status(404).json({ message: 'Administrator not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
