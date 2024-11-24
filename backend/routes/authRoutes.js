const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Address = require('../models/Address');
const sequelize = require('../dbconfig/sequelize');

const router = express.Router();

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user.user_id, role: user.role, is_farmer: user.is_farmer , name: user.name},
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/register', async (req, res) => {
    try {
        const { email, password, name, surname, contact_info, is_farmer, address} = req.body;

        const transaction = await sequelize.transaction();
        if (!email || !password || !name || !surname) {
            return res.status(400).json({ message: 'All required fields must be provided.' });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already registered.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

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
        console.error('Error registering user:', error.stack || error.message);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

module.exports = router;
