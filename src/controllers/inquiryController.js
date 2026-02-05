const { Inquiry, Product } = require('../models');
const nodemailer = require('nodemailer');

// Configure Email Transporter
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Create a new inquiry (Public API)
exports.createInquiry = async (req, res) => {
  try {
    const { name, email, phone, address, message, product_id } = req.body;
    
    // Basic validation
    if (!name || !phone) {
      return res.status(400).json({ message: 'Name and phone are required' });
    }

    const newInquiry = await Inquiry.create({
      name,
      email,
      phone,
      address,
      message,
      product_id: product_id || null
    });

    // Fetch product details if product_id exists
    let productName = 'General Inquiry';
    if (product_id) {
        const product = await Product.findByPk(product_id);
        if (product) {
            productName = product.product_name;
        }
    }

    // Send Email Notification to Admin
    const mailOptions = {
      from: `"${name}" <${email || process.env.MAIL_USER}>`, // sender address
      to: process.env.ADMIN_EMAIL, // list of receivers
      subject: `New Inquiry Received: ${productName}`, // Subject line
      html: `
        <h3>New Inquiry Received</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email || 'N/A'}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Address:</strong> ${address || 'N/A'}</p>
        <p><strong>Product Interest:</strong> ${productName}</p>
        <p><strong>Message:</strong></p>
        <blockquote style="background: #f9f9f9; padding: 10px; border-left: 5px solid #ccc;">
          ${message || 'No message content.'}
        </blockquote>
        <br>
        <p><small>This email was sent from the Nirvikar Ayurveda website inquiry form.</small></p>
      `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Inquiry notification email sent');
    } catch (emailError) {
        console.error('Error sending email:', emailError);
        // We don't block the response if email fails, but we log it.
    }

    res.status(201).json(newInquiry);
  } catch (error) {
    console.error('Error in createInquiry:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all inquiries (Admin API)
exports.getAllInquiries = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    if (status) {
      where.status = status;
    }

    const { count, rows } = await Inquiry.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'product_name']
        }
      ]
    });

    res.json({
      inquiries: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalInquiries: count
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single inquiry details
exports.getInquiryById = async (req, res) => {
  try {
    const { id } = req.params;
    const inquiry = await Inquiry.findByPk(id, {
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'product_name']
        }
      ]
    });

    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    res.json(inquiry);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update inquiry status
exports.updateInquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const inquiry = await Inquiry.findByPk(id);

    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    inquiry.status = status;
    await inquiry.save();

    res.json(inquiry);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete inquiry
exports.deleteInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const inquiry = await Inquiry.findByPk(id);

    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    await inquiry.destroy();
    res.json({ message: 'Inquiry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
