const { DataTypes } = require('sequelize');
const sequelize = require('../dbconfig/sequelize');
const Farmer = require('./Address');

const SelfHarvestEvent = sequelize.define('SelfHarvestEvent', {
    event_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Farmer,
            key: 'user_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
}, {
    tableName: 'SelfHarvestEvents',
});

SelfHarvestEvent.belongsTo(Farmer, { foreignKey: 'user_id' });

module.exports = SelfHarvestEvent;