const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductImage = sequelize.define('ProductImage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
        model: 'products',
        key: 'id'
    }
  },
  image_path: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  is_main: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'product_images',
  underscored: true,
  timestamps: true,
});

module.exports = ProductImage;
