const Category = require('./Category');
const Product = require('./Product');
const ProductImage = require('./ProductImage');
const AdminUser = require('./AdminUser');

// Associations
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

Product.hasMany(ProductImage, { foreignKey: 'product_id', as: 'images' });
ProductImage.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Self-referencing for Category hierarchy
Category.hasMany(Category, { foreignKey: 'parent_id', as: 'subcategories' });
Category.belongsTo(Category, { foreignKey: 'parent_id', as: 'parent' });

module.exports = {
  Category,
  Product,
  ProductImage,
  AdminUser,
};
