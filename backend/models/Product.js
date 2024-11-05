const { DataTypes } = require('sequelize');
const sequelize = require('../dbconfig/sequelize');
const Category = require('./Category'); // Assuming Category is already defined

const Product = sequelize.define('Product', {
    product_id: {
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
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: true, // Make category_id nullable to resolve the conflict
        references: {
            model: Category,
            key: 'category_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    },
}, {
    tableName: 'Products',
});

// Define relationship between Product and Category
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'Category' });

module.exports = Product;