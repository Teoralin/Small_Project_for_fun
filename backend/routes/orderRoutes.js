const express = require('express');
const { Order, Offer, OrderOffer } = require('../models'); 
const sequelize = require('../dbconfig/sequelize'); 

const router = express.Router();


router.post('/', async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { user_id, amount, offers } = req.body;

        if (!offers || !Array.isArray(offers) || offers.length === 0) {
            return res.status(400).json({ message: 'No offers provided for the order' });
        }

        // Create the new order
        const order = await Order.create(
            {
                user_id,
                amount,
            },
            { transaction }
        );

        const validOffers = await Offer.findAll({
            where: { offer_id: offers, status: 'Available' },
            transaction,
        });

        if (validOffers.length !== offers.length) {
            throw new Error('Some offers are invalid or not available');
        }

        const orderOffersData = validOffers.map((offer) => ({
            order_id: order.order_id,
            offer_id: offer.offer_id,
        }));
        await OrderOffer.bulkCreate(orderOffersData, { transaction });

        await Offer.update(
            { status: 'Sold' },
            {
                where: { offer_id: offers },
                transaction,
            }
        );

        // Commit the transaction
        await transaction.commit();

        res.status(201).json({ message: 'Order created successfully', order });
    } catch (error) {
        await transaction.rollback();
        console.error('Error creating order:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get all orders with associated offers
router.get('/', async (req, res) => {
    try {
        const orders = await Order.findAll({
            include: {
                model: Offer,
                as: 'Offers',
                through: { attributes: [] }, // Exclude the join table details
            },
        });

        res.status(200).json(orders);
    } catch (error) {
        console.error('Error retrieving orders:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get a single order by ID with associated offers
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id, {
            include: {
                model: Offer,
                as: 'Offers',
                through: { attributes: [] }, // Exclude the join table details
            },
        });

        if (order) {
            res.status(200).json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        console.error('Error retrieving order:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update an order and its associated offers
router.put('/:id', async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { amount, offers } = req.body;

        const order = await Order.findByPk(req.params.id, { transaction });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Update order details
        await order.update({ amount }, { transaction });

        if (offers && Array.isArray(offers) && offers.length > 0) {
            // Check if all offers exist and are available
            const validOffers = await Offer.findAll({
                where: { offer_id: offers, status: 'Available' },
                transaction,
            });

            if (validOffers.length !== offers.length) {
                throw new Error('Some offers are invalid or not available');
            }

            // Remove old associations
            await OrderOffer.destroy({ where: { order_id: order.order_id }, transaction });

            // Create new associations
            const orderOffersData = validOffers.map((offer) => ({
                order_id: order.order_id,
                offer_id: offer.offer_id,
            }));
            await OrderOffer.bulkCreate(orderOffersData, { transaction });

            // Update the status of the offers to "Sold"
            await Offer.update(
                { status: 'Sold' },
                {
                    where: { offer_id: offers },
                    transaction,
                }
            );
        }

        await transaction.commit();
        res.status(200).json({ message: 'Order updated successfully' });
    } catch (error) {
        await transaction.rollback();
        console.error('Error updating order:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete an order and disassociate its offers
router.delete('/:id', async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const order = await Order.findByPk(req.params.id, { transaction });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Find associated offers
        const associatedOffers = await order.getOffers({ transaction });

        // Update the status of associated offers to "Available"
        await Offer.update(
            { status: 'Available' },
            {
                where: { offer_id: associatedOffers.map((offer) => offer.offer_id) },
                transaction,
            }
        );

        // Remove order-offer associations
        await OrderOffer.destroy({ where: { order_id: order.order_id }, transaction });

        // Delete the order
        await order.destroy({ transaction });

        await transaction.commit();
        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        await transaction.rollback();
        console.error('Error deleting order:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
