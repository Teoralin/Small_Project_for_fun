// models/index.js
const sequelize = require('../dbconfig/sequelize');
const User = require('./User');
const Administrator = require('./Administrator');
const Moderator = require('./Moderator');
const RegisteredUser = require('./RegisteredUser');
const Category = require('./Category');
const Product = require('./Product');
const Farmer = require('./Farmer');
const Customer = require('./Customer');
const Offer = require('./Offer');
const SelfHarvestEvent = require('./SelfHarvestEvent');
const Order = require('./Order');
const Review = require('./Review');

// Export all models as a single module
module.exports = {
    sequelize,
    User,
    Administrator,
    Moderator,
    RegisteredUser,
    Category,
    Product,
    Farmer,
    Customer,
    Offer,
    SelfHarvestEvent,
    Order,
    Review,
};