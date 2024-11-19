const { DataTypes } = require('sequelize');
const sequelize = require('../dbconfig/sequelize');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
    user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
    surname: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    contact_info: {
        type: DataTypes.STRING,
    },
    role: {
        type: DataTypes.ENUM('Registered User', 'Moderator', 'Administrator'),
        allowNull: false,
        defaultValue: 'Registered User', // Default to "Registered User"
    },
}, {
    tableName: 'Users',
});

// Method to compare hashed password
User.prototype.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};

module.exports = User;

