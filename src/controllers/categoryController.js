const { Category } = require('../models');

exports.createCategory = async (req, res) => {
  try {
    const { category_name, slug, parent_id, status } = req.body;
    
    // Check if slug exists
    if (slug) {
        const existingCategory = await Category.findOne({ where: { slug } });
        if (existingCategory) {
            return res.status(400).json({ message: 'Slug already exists' });
        }
    }

    const category = await Category.create({
      category_name,
      slug,
      parent_id,
      status
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
        include: [
            { model: Category, as: 'subcategories' },
            { model: Category, as: 'parent' }
        ]
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id, {
        include: [
            { model: Category, as: 'subcategories' },
            { model: Category, as: 'parent' }
        ]
    });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { category_name, slug, parent_id, status } = req.body;
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Validate slug uniqueness if changed
    if (slug && slug !== category.slug) {
        const existingCategory = await Category.findOne({ where: { slug } });
        if (existingCategory) {
            return res.status(400).json({ message: 'Slug already exists' });
        }
    }

    await category.update({
      category_name,
      slug,
      parent_id,
      status
    });

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check for subcategories or products before delete? 
    // For now, simple delete. DB constraints might fail if restricted.

    await category.destroy();
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
