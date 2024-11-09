const express = require('express');
const bcrypt = require('bcrypt');
const { RegisteredUser, User, Farmer, Customer } = require('../models');


const router = express.Router();

// Create a new registered user
router.post('/', async (req, res) => {
    try {
        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        
        // Create a new User record
        const user = await User.create({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,  // Store hashed password
            name: req.body.name,
            contact_info: req.body.contact_info,
            role: 'Registered User',  // Set default role
        });

        // Create the associated RegisteredUser record
        const registeredUser = await RegisteredUser.create({
            user_id: user.user_id,
            assignedCategories: req.body.assignedCategories || null,
            isFarmer: req.body.isFarmer || false,
        });

        if (req.body.isFarmer) {
            await Farmer.create({ user_id: user.user_id });
        }
        
        await Customer.create({ user_id: user.user_id });

        // Send a single response after all operations are successful
        res.status(201).json({ message: 'Registered User created successfully', registeredUser });
    } catch (error) {
        console.error('Error creating registered user:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get all registered users (excluding password)
router.get('/', async (req, res) => {
    try {
        const registeredUsers = await RegisteredUser.findAll({
            include: [User],  // Include associated User information
            attributes: { exclude: ['password'] },  // Exclude password
        });

        res.status(200).json(registeredUsers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a single registered user by ID
router.get('/:id', async (req, res) => {
    try {
        const registeredUser = await RegisteredUser.findOne({
            where: { user_id: req.params.id },
            include: [User],  // Include associated User information
            attributes: { exclude: ['password'] },  // Exclude password
        });

        if (registeredUser) {
            res.status(200).json(registeredUser);
        } else {
            res.status(404).json({ message: 'Registered User not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a registered user's information
router.put('/:id', async (req, res) => {
    try {
        const registeredUser = await RegisteredUser.findOne({
            where: { user_id: req.params.id },
        });

        if (registeredUser) {
            const updatedRegisteredUser = await registeredUser.update({
                assignedCategories: req.body.assignedCategories || registeredUser.assignedCategories,
                isFarmer: req.body.isFarmer !== undefined ? req.body.isFarmer : registeredUser.isFarmer,
            });

            res.status(200).json({ message: 'Registered User updated successfully', updatedRegisteredUser });
        } else {
            res.status(404).json({ message: 'Registered User not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a registered user by ID
router.delete('/:id', async (req, res) => {
    try {
        // Find the RegisteredUser by ID
        const registeredUser = await RegisteredUser.findOne({
            where: { user_id: req.params.id },
        });

        if (registeredUser) {
            // Delete the associated User record
            const user = await User.findByPk(req.params.id);
            if (user) {
                await user.destroy(); // This will delete the User record from the Users table
            }

            // Now delete the RegisteredUser
            await registeredUser.destroy(); // This will delete the RegisteredUser record from the RegisteredUsers table

            res.status(200).json({ message: 'Registered User and associated User deleted successfully' });
        } else {
            res.status(404).json({ message: 'Registered User not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
