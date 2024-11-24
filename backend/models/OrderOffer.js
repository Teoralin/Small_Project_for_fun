const { DataTypes } = require('sequelize');
const sequelize = require('../dbconfig/sequelize');
const Order = require('./Order');
const Offer = require('./Offer');

const OrderOffer = sequelize.define('OrderOffer', {
    order_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: Order,
            key: 'order_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    offer_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: Offer,
            key: 'offer_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },

    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }

}, {
    tableName: 'OrderOffers',
});

Order.belongsToMany(Offer, {
    through: OrderOffer,
    foreignKey: 'order_id',
    otherKey: 'offer_id',
    as: 'Offers',
});

Offer.belongsToMany(Order, {
    through: OrderOffer,
    foreignKey: 'offer_id',
    otherKey: 'order_id',
    as: 'Orders',
});

module.exports = OrderOffer;
