const { DataTypes } = require('sequelize');
const sequelize = require('../dbconfig/sequelize');
const User = require('./User'); 

const Address = sequelize.define('Address', {
    address_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
    street: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    house_number:{
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    city:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    post_code:{
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: 'Address',
});

Address.belongsTo(User, { foreignKey: 'user_id', as: 'User' });

module.exports = Address;