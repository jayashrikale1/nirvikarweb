const { Product, Category } = require('../models');

exports.getDashboardStats = async (req, res) => {
  try {
    const productCount = await Product.count();
    const categoryCount = await Category.count();
    // Placeholder for orders since Order model doesn't exist yet
    const orderCount = 0; 

    res.json({
      totalProducts: productCount,
      totalCategories: categoryCount,
      totalOrders: orderCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
