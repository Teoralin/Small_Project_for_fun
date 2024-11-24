const express = require('express');
const { Order, Offer, OrderOffer, Product } = require('../models');
const sequelize = require('../dbconfig/sequelize');
const { getCart, clearCart } = require('../middleware/cartService');
const {jwtDecode} = require('jwt-decode');

const router = express.Router();


router.post('/', async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { user_id, amount, offers } = req.body;

        if (!offers || !Array.isArray(offers) || offers.length === 0) {
            return res.status(400).json({ message: 'No offers provided for the order' });
        }

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

        await transaction.commit();

        res.status(201).json({ message: 'Order created successfully', order });
    } catch (error) {
        await transaction.rollback();
        console.error('Error creating order:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const orders = await Order.findAll({
            include: {
                model: Offer,
                as: 'Offers',
                through: { attributes: [] },
            },
        });

        res.status(200).json(orders);
    } catch (error) {
        console.error('Error retrieving orders:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/by-user', async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required.' });
        }

        const orders = await Order.findAll({
            where: { user_id: userId },
            order: [['date', 'DESC']],
        });

        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching orders by user_id:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/getAllOffersForUser/:user_id', async (req, res) => {
    try {
        const { user_id } = req.params;

        const orders = await Order.findAll({
            where: { user_id },
            attributes: ['order_id'],
        });

        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: 'No orders found for this user.' });
        }

        const orderIds = orders.map((order) => order.order_id);

        const orderOffers = await OrderOffer.findAll({
            where: { order_id: orderIds },
            attributes: ['offer_id'],
        });

        if (!orderOffers || orderOffers.length === 0) {
            return res.status(404).json({ message: 'No offers found for this user\'s orders.' });
        }

        const uniqueOfferIds = [
            ...new Set(orderOffers.map((orderOffer) => orderOffer.offer_id)),
        ];

        const offers = await Offer.findAll({
            where: { offer_id: uniqueOfferIds },
            include: [
                {
                    model: Product,
                    attributes: ['name'],
                },
            ],
            attributes: ['offer_id', 'price'],
        });

        const offersWithDetails = offers.map((offer) => ({
            offer_id: offer.offer_id,
            product_name: offer.Product.name,
            price: offer.price,
        }));

        res.status(200).json(offersWithDetails);
    } catch (error) {
        console.error('Error retrieving offers for user:', error);
        res.status(500).json({ error: error.message });
    }
});


router.get('/:order_id', async (req, res) => {
    try {
        const { order_id } = req.params;

        const orderOffers = await OrderOffer.findAll({
            where: { order_id },
        });

        if (!orderOffers.length) {
            return res.status(404).json({ message: 'No offers found for this order.' });
        }

        const offersWithDetails = await Promise.all(
            orderOffers.map(async (orderOffer) => {
                const offer = await Offer.findByPk(orderOffer.offer_id, {
                    include: [
                        {
                            model: Product,
                            attributes: ['name'],
                        },
                    ],
                    attributes: ['price'],
                });

                if (offer) {
                    return {
                        offer_name: offer.Product.name,
                        price: parseFloat(offer.price) * orderOffer.quantity,
                        quantity: orderOffer.quantity
                    };
                }

                return null;
            })
        );

        const validOffers = offersWithDetails.filter((offer) => offer !== null);

        res.status(200).json(validOffers);
    } catch (error) {
        console.error('Error retrieving offers by order_id:', error);
        res.status(500).json({ error: error.message });
    }
});



router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id, {
            include: {
                model: Offer,
                as: 'Offers',
                through: { attributes: [] },
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

router.put('/:id', async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { amount, offers } = req.body;

        const order = await Order.findByPk(req.params.id, { transaction });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        await order.update({ amount }, { transaction });

        if (offers && Array.isArray(offers) && offers.length > 0) {
            const validOffers = await Offer.findAll({
                where: { offer_id: offers, status: 'Available' },
                transaction,
            });

            if (validOffers.length !== offers.length) {
                throw new Error('Some offers are invalid or not available');
            }

            await OrderOffer.destroy({ where: { order_id: order.order_id }, transaction });

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
        }

        await transaction.commit();
        res.status(200).json({ message: 'Order updated successfully' });
    } catch (error) {
        await transaction.rollback();
        console.error('Error updating order:', error);
        res.status(500).json({ error: error.message });
    }
});



router.delete('/:id', async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const order = await Order.findByPk(req.params.id, { transaction });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const associatedOffers = await order.getOffers({ transaction });

        await Offer.update(
            { status: 'Available' },
            {
                where: { offer_id: associatedOffers.map((offer) => offer.offer_id) },
                transaction,
            }
        );

        await OrderOffer.destroy({ where: { order_id: order.order_id }, transaction });

        await order.destroy({ transaction });

        await transaction.commit();
        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        await transaction.rollback();
        console.error('Error deleting order:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/checkout', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const { userId } = jwtDecode(token);

        const cart = getCart(userId);
        if (!cart || cart.length === 0) {
            return res.status(400).json({ message: 'Cart is empty.' });
        }

        let totalPrice = 0;
        const validatedItems = [];

        for (const item of cart) {
            const offer = await Offer.findByPk(item.offer_id);

            if (!offer) {
                return res.status(404).json({ message: `Offer with ID ${item.offer_id} not found.` });
            }

            if (offer.quantity < item.quantity) {
                return res.status(400).json({
                    message: `Requested quantity (${item.quantity}) exceeds available stock (${offer.quantity}) for offer ID ${item.offer_id}.`
                });
            }

            totalPrice += offer.price * item.quantity;

            validatedItems.push({
                offer_id: item.offer_id,
                quantity: item.quantity,
                price: offer.price,
            });
        }

        const newOrder = await Order.create({
            user_id: userId,
            date: new Date(),
            amount: totalPrice,
        });

        for (const item of validatedItems) {
            await OrderOffer.create({
                order_id: newOrder.order_id,
                quantity: item.quantity,
                offer_id: item.offer_id,
            });

            const offer = await Offer.findByPk(item.offer_id);
            await offer.update({
                quantity: offer.quantity - item.quantity,
                status: offer.quantity - item.quantity === 0 ? 'Sold' : 'Available',
            });
        }

        clearCart(userId);

        res.status(201).json({
            message: 'Order created successfully.',
            order: {
                id: newOrder.order_id,
                total: totalPrice,
                items: validatedItems,
            },
        });
    } catch (error) {
        console.error('Error during checkout:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

module.exports = router;
