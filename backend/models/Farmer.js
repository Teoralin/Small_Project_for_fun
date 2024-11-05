const { DataTypes } = require('sequelize');
const sequelize = require('../dbconfig/sequelize');
const RegisteredUser = require('./RegisteredUser'); // Assuming RegisteredUser is already defined

const Farmer = sequelize.define('Farmer', {
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
    tableName: 'Farmers',
});

// Link Farmer to RegisteredUser
Farmer.belongsTo(RegisteredUser, { foreignKey: 'user_id', as: 'RegisteredUser' });

module.exports = Farmer;