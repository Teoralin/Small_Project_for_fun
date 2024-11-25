const { DataTypes } = require('sequelize');
const sequelize = require('../dbconfig/sequelize');
const Offer = require('./Offer');
const Address = require('./Address');

const SelfHarvestEvent = sequelize.define('SelfHarvestEvent', {
    event_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    offer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Offer,
            key: 'offer_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    address_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Address,
            key: 'address_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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

SelfHarvestEvent.belongsTo(Offer, { foreignKey: 'offer_id' });
SelfHarvestEvent.belongsTo(Address, {foreignKey: 'address_id'});

module.exports = SelfHarvestEvent;