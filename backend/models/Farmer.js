const { DataTypes } = require('sequelize');
const sequelize = require('../dbconfig/sequelize');
const User = require('./User'); 

const Farmer = sequelize.define('Farmer', {
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
    tableName: 'Farmers',
});

Farmer.belongsTo(User, { foreignKey: 'user_id', as: 'User' });

module.exports = Farmer;