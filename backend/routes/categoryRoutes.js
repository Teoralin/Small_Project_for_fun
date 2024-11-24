const express = require('express');
const { Category } = require('../models');

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { name, description, parent_category_id, was_approved } = req.body;

        const category = await Category.create({
            name,
            description,
            parent_category_id: parent_category_id || null,
            was_approved: was_approved || false,
        });

        res.status(201).json({ message: 'Category created successfully', category });
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const categories = await Category.findAll({
            include: {
                model: Category,
                as: 'Subcategories',
                attributes: ['category_id', 'name', 'description', 'was_approved'],
            },
        });

        res.status(200).json(categories);
    } catch (error) {
        console.error('Error retrieving categories:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id, {
            include: [
                { model: Category, as: 'ParentCategory', attributes: ['category_id', 'name'] },
                { model: Category, as: 'Subcategories', attributes: ['category_id', 'name', 'description','was_approved'] },
            ],
        });

        if (category) {
            res.status(200).json(category);
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        console.error('Error retrieving category:', error);
        res.status(500).json({ error: error.message });
    }
});


router.put('/:id', async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (category) {
            const updatedCategory = await category.update({
                name: req.body.name || category.name,
                description: req.body.description || category.description,
                parent_category_id: req.body.parent_category_id || category.parent_category_id,
                was_approved: req.body.was_approved !== false ? req.body.was_approved : category.was_approved,
            });

            res.status(200).json({ message: 'Category updated successfully', updatedCategory });
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (category) {
            await category.destroy();
            res.status(200).json({ message: 'Category deleted successfully' });
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
