const { Product, Category, Inquiry } = require('../models');

exports.getDashboardStats = async (req, res) => {
  try {
    const productCount = await Product.count();
    const categoryCount = await Category.count();
    const inquiryCount = await Inquiry.count();

    // Fetch recent inquiries (limit 5)
    const recentInquiries = await Inquiry.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      include: [{ model: Product, as: 'product', attributes: ['product_name'] }]
    });

    // Format for recent activity
    const recentActivity = recentInquiries.map(inquiry => ({
      id: inquiry.id,
      type: 'inquiry',
      message: `New inquiry from ${inquiry.name} for ${inquiry.product ? inquiry.product.product_name : 'General Inquiry'}`,
      date: inquiry.createdAt
    }));

    res.json({
      totalProducts: productCount,
      totalCategories: categoryCount,
      totalInquiries: inquiryCount,
      recentActivity
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
