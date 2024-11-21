const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Address = require('../models/Address');
const sequelize = require('../dbconfig/sequelize');

const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare passwords
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user.user_id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Registration route
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, surname, contact_info, is_farmer, address} = req.body;

        const transaction = await sequelize.transaction();
        // Validate input
        if (!email || !password || !name || !surname) {
            return res.status(400).json({ message: 'All required fields must be provided.' });
        }

        // Check if the email is already registered
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already registered.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the new user with the provided is_farmer field
        const newUser = await User.create({
            email,
            password: hashedPassword,
            name,
            surname,
            contact_info,
            is_farmer: is_farmer || false,
        },

        { transaction }
    );

        if (is_farmer && address) {
            const { street, house_number, city, post_code } = address;

            // Validate address fields
            if (!street || !house_number || !city || !post_code) {
                throw new Error('All address fields must be provided for a farmer.');
            }

            await Address.create(
                {
                    user_id: newUser.user_id,  
                    street,
                    house_number,
                    city,
                    post_code,
                },
                { transaction }
            );
        }

        await transaction.commit();
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: newUser.user_id,
                email: newUser.email,
                name: newUser.name,
                surname: newUser.surname,
                contact_info: newUser.contact_info,
                is_farmer: newUser.is_farmer,
            },
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

module.exports = router;
