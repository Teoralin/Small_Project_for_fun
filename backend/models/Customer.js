const { DataTypes } = require('sequelize');
const sequelize = require('../dbconfig/sequelize');
const RegisteredUser = require('./RegisteredUser'); // Assuming RegisteredUser is already defined

const Customer = sequelize.define('Customer', {
    user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: RegisteredUser,
            key: 'user_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
}, {
    tableName: 'Customers',
});

// Link Customer to RegisteredUser
Customer.belongsTo(RegisteredUser, { foreignKey: 'user_id', as: 'RegisteredUser' });

module.exports = Customer;
