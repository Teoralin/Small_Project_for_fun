const { DataTypes } = require('sequelize');
const sequelize = require('../dbconfig/sequelize');

const Category = sequelize.define('Category', {
    category_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    parent_category_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Categories', 
            key: 'category_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    was_approved:{
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    tableName: 'Categories',
});

Category.belongsTo(Category, { as: 'ParentCategory', foreignKey: 'parent_category_id', onDelete: 'CASCADE' });
Category.hasMany(Category, { as: 'Subcategories', foreignKey: 'parent_category_id', onDelete: 'CASCADE' });

module.exports = Category;