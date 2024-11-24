const sequelize = require('../dbconfig/sequelize');
const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const Address = require('./Address');
const Offer = require('./Offer');
const SelfHarvestEvent = require('./SelfHarvestEvent');
const Order = require('./Order');
const OrderOffer = require('./OrderOffer');
const Review = require('./Review');

module.exports = {
    sequelize,
    User,
    Category,
    Product,
    Address,
    Offer,
    SelfHarvestEvent,
    Order,
    OrderOffer,
    Review,
};