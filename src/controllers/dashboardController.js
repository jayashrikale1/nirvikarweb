const { Product, Category, Inquiry } = require('../models');

exports.getDashboardStats = async (req, res) => {
  try {
    const productCount = await Product.count();
    const categoryCount = await Category.count();
    const inquiryCount = await Inquiry.count();

    res.json({
      totalProducts: productCount,
      totalCategories: categoryCount,
      totalInquiries: inquiryCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
