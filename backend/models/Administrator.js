const sequelize = require('../dbconfig/sequelize');
const User = require('./User');
const async_hooks = require("node:async_hooks");

const Administrator = sequelize.define('Administrator', {}, {
    tableName: 'Administrators',
});

Administrator.belongsTo(User, { foreignKey: 'user_id' });
module.exports = Administrator;