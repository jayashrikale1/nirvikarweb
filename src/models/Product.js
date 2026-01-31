const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
        model: 'categories',
        key: 'id'
    }
  },
  product_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  brand: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  short_description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  full_description: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
  },
  uses: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  material: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  country_of_origin: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  mrp_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  selling_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  doctor_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  has_variant: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  variant_name: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  variant_values: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  specifications_json: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  stock_quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  home_delivery: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  main_image: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'products',
  underscored: true,
  timestamps: true,
});

module.exports = Product;
