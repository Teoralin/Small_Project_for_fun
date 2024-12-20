const express = require('express');
const { Address, User } = require('../models');

const router = express.Router();


router.post('/', async (req, res) => {
    try {
        const dUser = await User.findByPk(req.body.user_id);
        if (!User) {
            return res.status(404).json({ message: 'User not found' });
        }

        const farmer = await Address.create({
            user_id: req.body.user_id,
        });

        res.status(201).json({ message: 'Address added successfully', farmer });
    } catch (error) {
        console.error('Error creating farmer:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const farmers = await Address.findAll({
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

router.get('/:id', async (req, res) => {
    try {
        const farmer = await Address.findOne({
            where: { user_id: req.params.id }, 
            include: [
                {
                    model: User,
                    as: 'User',
                },
            ],
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


router.put('/:id', async (req, res) => {
    try {
        const farmer = await Address.findOne({
            where: { user_id: req.params.id },
            include: [
                {
                    model: User,
                    as: 'User',
                },
            ],
        });

        if (!farmer) {
            return res.status(404).json({ message: 'Farmer not found' });
        }

        if (req.body.user_id && req.body.user_id !== req.params.userId) {
            const user = await User.findByPk(req.body.user_id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
        }

        await farmer.update(req.body);

        res.status(200).json({ message: 'Farmer updated successfully', farmer });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.delete('/:id', async (req, res) => {
    try {
        const farmer = await Address.findOne({
            where: { user_id: req.params.id },
        });

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
