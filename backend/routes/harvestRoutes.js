const express = require('express');
const SelfHarvestEvent = require('../models/SelfHarvestEvent');
const Offer = require('../models/Offer');
const Address = require('../models/Address');

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { offer_id, address_id, start_date, end_date } = req.body;

        if (!offer_id || !address_id || !start_date || !end_date) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const offer = await Offer.findByPk(offer_id);
        if (!offer) {
            return res.status(404).json({ message: 'Offer not found' });
        }

        const newEvent = await SelfHarvestEvent.create({
            offer_id,
            address_id,
            start_date,
            end_date,
        });

        offer.is_pickable = true;
        await offer.save();

        res.status(201).json({
            message: 'Self-harvest event created successfully',
            newEvent,
        });
    } catch (error) {
        console.error('Error creating self-harvest event:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/offer/:offer_id', async (req, res) => {
    try {
        const { offer_id } = req.params;

        const events = await SelfHarvestEvent.findAll({
            where: { offer_id },
            include: [
                { model: Offer, attributes: ['price', 'quantity', 'status'] },
                { model: Address, attributes: ['street', 'city', 'post_code', 'house_number'] },
            ],
        });

        if (events.length > 0) {
            res.status(200).json(events);
        } else {
            res.status(404).json({ message: 'No self-harvest events found for this offer' });
        }
    } catch (error) {
        console.error('Error fetching self-harvest events:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const { offer_id } = req.params;

        const events = await SelfHarvestEvent.findAll({
            include: [
                { model: Offer, attributes: ['price', 'quantity', 'status'] },
                { model: Address, attributes: ['street', 'city', 'post_code', 'house_number'] },
            ],
        });

        if (events.length > 0) {
            res.status(200).json(events);
        } else {
            res.status(404).json({ message: 'No self-harvest events found for this offer' });
        }
    } catch (error) {
        console.error('Error fetching self-harvest events:', error);
        res.status(500).json({ error: error.message });
    }
});

router.put('/:event_id', async (req, res) => {
    try {
        const { event_id } = req.params;

        const event = await SelfHarvestEvent.findByPk(event_id);

        if (event) {
            const updatedEvent = await event.update({
                start_date: req.body.start_date || event.start_date,
                end_date: req.body.end_date || event.end_date,
                address_id: req.body.address_id || event.address_id,
            });

            res.status(200).json({ message: 'Self-harvest event updated successfully', updatedEvent });
        } else {
            res.status(404).json({ message: 'Self-harvest event not found' });
        }
    } catch (error) {
        console.error('Error updating self-harvest event:', error);
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:event_id', async (req, res) => {
    try {
        const { event_id } = req.params;

        const event = await SelfHarvestEvent.findByPk(event_id);

        if (event) {
            await event.destroy();
            res.status(200).json({ message: 'Self-harvest event deleted successfully' });
        } else {
            res.status(404).json({ message: 'Self-harvest event not found' });
        }
    } catch (error) {
        console.error('Error deleting self-harvest event:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;