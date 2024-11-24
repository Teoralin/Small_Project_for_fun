const express = require('express');
const { Product, Category } = require('../models');

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { name, description, category_id } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).json({ message: 'Product name is required.' });
        }

        const product = await Product.create({
            name,
            description,
            category_id,
        });

        res.status(201).json({ message: 'Product created successfully', product });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: error.message });
    }
});


router.get('/', async (req, res) => {
    try {
        const products = await Product.findAll({
            include: {
                model: Category,
                as: 'Category',
                attributes: ['category_id', 'name'],
            },
        });

        res.status(200).json(products);
    } catch (error) {
        console.error('Error retrieving products:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            include: {
                model: Category,
                as: 'Category',
                attributes: ['category_id', 'name'],
            },
        });

        if (product) {
            res.status(200).json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error('Error retrieving product:', error);
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (product) {
            const updatedProduct = await product.update({
                name: req.body.name || product.name,
                description: req.body.description || product.description,
                category_id: req.body.category_id || product.category_id,
            });

            res.status(200).json({ message: 'Product updated successfully', updatedProduct });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (product) {
            await product.destroy();
            res.status(200).json({ message: 'Product deleted successfully' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
