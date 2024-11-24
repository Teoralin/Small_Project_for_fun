const { DataTypes } = require('sequelize');
const sequelize = require('../dbconfig/sequelize');
const User = require('./User');
const Offer = require('./Offer');

const Review = sequelize.define('Review', {
    review_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5,
        },
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'user_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    offer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references:{
            model: Offer,
            key: 'offer_id',
        }
    }
}, {
    tableName: 'Reviews',
});

Review.belongsTo(User, { foreignKey: 'user_id', as: 'User' });
Review.belongsTo(Offer, { foreignKey: 'offer_id', as: 'Offer' });

module.exports = Review;