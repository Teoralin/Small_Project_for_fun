const { DataTypes } = require('sequelize');
const sequelize = require('../dbconfig/sequelize');
const Customer = require('./Customer'); // Assuming Customer model represents the user_id of the customer

const Order = sequelize.define('Order', {
    order_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Customer,
            key: 'user_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
}, {
    tableName: 'Orders',
});

Order.belongsTo(Customer, { foreignKey: 'user_id', as: 'Customer' });

module.exports = Order;
