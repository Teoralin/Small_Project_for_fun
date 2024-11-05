const { DataTypes } = require('sequelize');
const sequelize = require('../dbconfig/sequelize');

const Category = sequelize.define('Category', {
    category_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    parent_category_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Categories', // references this table
            key: 'category_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    },
}, {
    tableName: 'Categories',
});

// Define self-reference for parent-child relationship
Category.belongsTo(Category, { as: 'ParentCategory', foreignKey: 'parent_category_id' });
Category.hasMany(Category, { as: 'Subcategories', foreignKey: 'parent_category_id' });

module.exports = Category;