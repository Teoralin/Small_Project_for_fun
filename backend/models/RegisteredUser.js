const { DataTypes } = require('sequelize');
const sequelize = require('../dbconfig/sequelize');
const User = require('./User');

const RegisteredUser = sequelize.define('RegisteredUser', {
    assignedCategories: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    isFarmer: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    tableName: 'RegisteredUsers',
});

RegisteredUser.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE' });
module.exports = RegisteredUser;
