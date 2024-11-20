const { DataTypes } = require('sequelize');
const sequelize = require('../dbconfig/sequelize');
const User = require('./User');

const Customer = sequelize.define('Customer', {
    user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: User,
            key: 'user_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
}, {
    tableName: 'Customers',
});

Customer.belongsTo(User, { foreignKey: 'user_id', as: 'User' });

module.exports = Customer;
