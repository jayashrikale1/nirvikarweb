const Category = require('./Category');
const Product = require('./Product');
const ProductImage = require('./ProductImage');
const AdminUser = require('./AdminUser');

// Associations
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

Product.hasMany(ProductImage, { foreignKey: 'product_id', as: 'images' });
ProductImage.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

module.exports = {
  Category,
  Product,
  ProductImage,
  AdminUser,
};
