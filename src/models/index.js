const Category = require('./Category');
const Product = require('./Product');
const ProductImage = require('./ProductImage');
const AdminUser = require('./AdminUser');
const Inquiry = require('./Inquiry');

// Associations
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

Product.hasMany(ProductImage, { foreignKey: 'product_id', as: 'images' });
ProductImage.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Inquiry associations (optional, if we want to link inquiry to product)
Inquiry.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
Product.hasMany(Inquiry, { foreignKey: 'product_id', as: 'inquiries' });

module.exports = {
  Category,
  Product,
  ProductImage,
  AdminUser,
  Inquiry,
};
