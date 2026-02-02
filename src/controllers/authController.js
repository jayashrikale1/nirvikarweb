const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { AdminUser } = require('../models');

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    
    // Check if admin exists
    const existingAdmin = await AdminUser.findOne({ where: { email } });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const admin = await AdminUser.create({ 
        name, 
        email, 
        password,
        phone,
        role: role || 'admin'
    });
    
    res.status(201).json({ message: 'Admin registered successfully', adminId: admin.id });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await AdminUser.findOne({ where: { email } });
    if (!admin) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!admin.status) {
        return res.status(403).json({ message: 'Account is inactive' });
    }

    const isMatch = await admin.validatePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update last login
    admin.last_login = new Date();
    await admin.save();

    const token = jwt.sign(
        { id: admin.id, role: admin.role }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1d' }
    );

    res.json({ 
        token, 
        admin: { 
            id: admin.id, 
            name: admin.name,
            email: admin.email,
            role: admin.role
        } 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const adminId = req.admin.id;

        const admin = await AdminUser.findByPk(adminId);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        const isMatch = await admin.validatePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password' });
        }

        admin.password = newPassword; // Hook will hash it
        await admin.save();

        res.json({ message: 'Password updated successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const admin = await AdminUser.findOne({ where: { email } });
        
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // In a real app, send email with reset token
        // For now, just return success
        res.json({ message: 'Password reset link sent to email' });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const admin = await AdminUser.findByPk(req.admin.id, {
            attributes: { exclude: ['password'] }
        });
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.json(admin);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        const admin = await AdminUser.findByPk(req.admin.id);

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Check if email is being changed and if it's already taken
        if (email && email !== admin.email) {
            const existingAdmin = await AdminUser.findOne({ where: { email } });
            if (existingAdmin) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }

        admin.name = name || admin.name;
        admin.email = email || admin.email;
        admin.phone = phone || admin.phone;

        await admin.save();

        res.json({ 
            message: 'Profile updated successfully',
            admin: {
                id: admin.id,
                name: admin.name,
                email: admin.email,
                phone: admin.phone,
                role: admin.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
