const { DataTypes } = require('sequelize');
const sequelize = require('../dbconfig/sequelize');
const Product = require('./Product');
const User = require('./User');

const Offer = sequelize.define('Offer', {
    offer_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    product_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Product,
            key: 'product_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    user_id: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'user_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('Available', 'Sold'),
        defaultValue: 'Available',
    },
    is_pickable: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    tableName: 'Offers',
});

Offer.belongsTo(Product, { foreignKey: 'product_id' });
Offer.belongsTo(User, { foreignKey: 'user_id' });

module.exports = Offer;