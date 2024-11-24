const express = require('express');
const { Review, User, Offer } = require('../models');
const router = express.Router();
const { jwtDecode } = require('jwt-decode');

router.post('/', async (req, res) => {
    try {
        const { rating, offer_id } = req.body;
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized. Please log in.' });
        }

        const decodedToken = jwtDecode(token);
        const user_id = decodedToken.userId;

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
        }

        const offer = await Offer.findByPk(offer_id);
        if (!offer) {
            return res.status(404).json({ message: 'Offer not found.' });
        }

        const existingReview = await Review.findOne({
            where: { user_id, offer_id },
        });

        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this offer.' });
        }

        const review = await Review.create({
            rating,
            user_id,
            offer_id,
        });

        res.status(201).json({ message: 'Review created successfully.', review });
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/getAverage/:offer_id', async (req, res) => {
    try {
        const { offer_id } = req.params;

        const reviews = await Review.findAll({
            where: { offer_id },
            attributes: ['rating'],
        });

        if (reviews.length === 0) {
            return res.status(200).json({ averageRating: 0 });
        }

        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / reviews.length;

        res.status(200).json({ averageRating: averageRating.toFixed(2) });
    } catch (error) {
        console.error('Error fetching average rating:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/:user_id/:offer_id', async (req, res) => {
    try {
        const { user_id, offer_id } = req.params;

        const review = await Review.findOne({
            where: { user_id, offer_id },
        });

        if (!review) {
            return res.status(404).json({ message: 'Review not found.' });
        }

        res.status(200).json(review);
    } catch (error) {
        console.error('Error fetching review:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/offer/:offer_id', async (req, res) => {
    try {
        const { offer_id } = req.params;

        const reviews = await Review.findAll({
            where: { offer_id },
            include: [
                { model: User, as: 'User', attributes: ['name', 'email'] },
            ],
        });

        res.status(200).json(reviews);
    } catch (error) {
        console.error('Error fetching reviews by offer_id:', error);
        res.status(500).json({ error: error.message });
    }
});

router.put('/:review_id', async (req, res) => {
    try {
        const { review_id } = req.params;
        const { rating } = req.body;

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
        }

        const review = await Review.findByPk(review_id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found.' });
        }

        await review.update({ rating });

        res.status(200).json({ message: 'Review updated successfully.', review });
    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({ error: error.message });
    }
});



router.delete('/:review_id', async (req, res) => {
    try {
        const { review_id } = req.params;

        const review = await Review.findByPk(review_id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found.' });
        }

        await review.destroy();

        res.status(200).json({ message: 'Review deleted successfully.' });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
