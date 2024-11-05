const sequelize = require('../dbconfig/sequelize');
const User = require('./User');

const Moderator = sequelize.define('Moderator', {}, {
    tableName: 'Moderators',
});

Moderator.belongsTo(User, { foreignKey: 'user_id' });
module.exports = Moderator;
