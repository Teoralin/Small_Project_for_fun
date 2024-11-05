const { DataTypes } = require('sequelize');
const sequelize = require('../dbconfig/sequelize');

const User = sequelize.define('User', {
    user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    contact_info: {
        type: DataTypes.STRING,
    },
    role: {
        type: DataTypes.ENUM('Registered User', 'Moderator', 'Administrator'),
        allowNull: false,
    },
}, {
    tableName: 'Users',
});

module.exports = User;
