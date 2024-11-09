// routes/customerRoutes.js
const express = require('express');
const { Customer, RegisteredUser } = require('../models'); // Import Customer and RegisteredUser models

const router = express.Router();

// Create a new customer
router.post('/', async (req, res) => {
    try {
        // Check if the registered user exists
        const registeredUser = await RegisteredUser.findByPk(req.body.user_id);
        if (!registeredUser) {
            return res.status(404).json({ message: 'RegisteredUser not found' });
        }

        // Create the customer and associate it with the registered user
        const customer = await Customer.create({
            user_id: req.body.user_id,
        });

        res.status(201).json({ message: 'Customer created successfully', customer });
    } catch (error) {
        console.error('Error creating customer:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get all customers
router.get('/', async (req, res) => {
    try {
        const customers = await Customer.findAll({
            include: [{
                model: RegisteredUser,
                as: 'RegisteredUser', // Including associated RegisteredUser
            }]
        });
        res.status(200).json(customers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a single customer by ID
router.get('/:id', async (req, res) => {
    try {
        const customer = await Customer.findByPk(req.params.id, {
            include: [{
                model: RegisteredUser,
                as: 'RegisteredUser', // Including associated RegisteredUser
            }]
        });

        if (customer) {
            res.status(200).json(customer);
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a customer by ID
router.put('/:id', async (req, res) => {
    try {
        const customer = await Customer.findByPk(req.params.id);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // Optionally, check if the registered user exists before updating
        if (req.body.user_id) {
            const registeredUser = await RegisteredUser.findByPk(req.body.user_id);
            if (!registeredUser) {
                return res.status(404).json({ message: 'RegisteredUser not found' });
            }
        }

        await customer.update(req.body);
        res.status(200).json({ message: 'Customer updated successfully', customer });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a customer by ID
router.delete('/:id', async (req, res) => {
    try {
        const customer = await Customer.findByPk(req.params.id);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        await customer.destroy();
        res.status(200).json({ message: 'Customer deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
