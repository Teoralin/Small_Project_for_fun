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

// Get offers by order_id
router.get('/:order_id', async (req, res) => {
    try {
        const { order_id } = req.params;

        // Retrieve all rows from OrderOffers filtered by order_id
        const orderOffers = await OrderOffer.findAll({
            where: { order_id }, // Filter by order_id
        });

        if (!orderOffers.length) {
            return res.status(404).json({ message: 'No offers found for this order.' });
        }

        // Fetch offer details for each offer_id in OrderOffers
        const offersWithDetails = await Promise.all(
            orderOffers.map(async (orderOffer) => {
                const offer = await Offer.findByPk(orderOffer.offer_id, {
                    include: [
                        {
                            model: Product,
                            attributes: ['name'], // Fetch the product name
                        },
                    ],
                    attributes: ['price'], // Fetch the price
                });

                if (offer) {
                    return {
                        offer_name: offer.Product.name, // Product name from the included Product model
                        price: parseFloat(offer.price) * orderOffer.quantity, // Calculate the total price
                    };
                }

                return null; // Skip offers that are not found
            })
        );

        // Filter out any null results (e.g., if an offer is missing)
        const validOffers = offersWithDetails.filter((offer) => offer !== null);

        res.status(200).json(validOffers);
    } catch (error) {
        console.error('Error retrieving offers by order_id:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get orders by user_id
router.get('/user', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized. Please log in.' });
        }

        // Decode token to get user_id
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.userId;

        // Retrieve all orders for the given user_id
        const orders = await Order.findAll({
            where: { user_id: userId },
            order: [['date', 'DESC']], // Orders by most recent
        });

        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching orders by user_id:', error);
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

// Checkout Route
router.post('/checkout', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        // Decode user ID from token
        const { userId } = jwtDecode(token);

        // Get the user's cart from the cart service
        const cart = getCart(userId);
        if (!cart || cart.length === 0) {
            return res.status(400).json({ message: 'Cart is empty.' });
        }

        // Validate cart items and calculate total price
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

            // Add validated item for further processing
            validatedItems.push({
                offer_id: item.offer_id,
                quantity: item.quantity,
                price: offer.price,
            });
        }

        // Create a new order
        const newOrder = await Order.create({
            user_id: userId,
            date: new Date(),
            amount: totalPrice,
        });

        // Insert into OrderOffer table and update Offer quantities
        for (const item of validatedItems) {
            await OrderOffer.create({
                order_id: newOrder.order_id,
                quantity: item.quantity,
                offer_id: item.offer_id,
            });

            // Deduct purchased quantity from the offer
            const offer = await Offer.findByPk(item.offer_id);
            await offer.update({
                quantity: offer.quantity - item.quantity,
                status: offer.quantity - item.quantity === 0 ? 'Sold' : 'Available',
            });
        }

        // Clear the user's cart
        clearCart(userId);

        // Return success response
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
