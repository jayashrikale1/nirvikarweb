const { Product, ProductImage, Category } = require('../models');
const fs = require('fs');
const path = require('path');

exports.createProduct = async (req, res) => {
  try {
    const { 
        category_id, 
        product_name, 
        slug, 
        brand, 
        short_description, 
        full_description, 
        uses, 
        material, 
        country_of_origin, 
        mrp_price, 
        selling_price, 
        doctor_price, 
        has_variant, 
        variant_name, 
        variant_values, 
        specifications_json, 
        stock_quantity, 
        home_delivery, 
        status 
    } = req.body;

    let main_image = null;
    
    // Handle main image
    if (req.files && req.files['main_image'] && req.files['main_image'][0]) {
        main_image = req.files['main_image'][0].path.replace(/\\/g, "/");
    }

    // Parse specifications_json if it comes as a string (from form-data)
    let parsedSpecs = specifications_json;
    if (typeof specifications_json === 'string') {
        try {
            parsedSpecs = JSON.parse(specifications_json);
        } catch (e) {
            console.error("Failed to parse specifications_json", e);
            parsedSpecs = {};
        }
    }

    const product = await Product.create({
        category_id,
        product_name,
        slug,
        brand,
        short_description,
        full_description,
        uses,
        material,
        country_of_origin,
        mrp_price,
        selling_price,
        doctor_price,
        has_variant: has_variant === 'true' || has_variant === true,
        variant_name,
        variant_values,
        specifications_json: parsedSpecs,
        stock_quantity,
        home_delivery: home_delivery === 'true' || home_delivery === true,
        main_image,
        status: status === 'true' || status === true
    });

    // Handle additional product images
    if (req.files && req.files['images']) {
        const imagePromises = req.files['images'].map(file => {
            return ProductImage.create({
                product_id: product.id,
                image_path: file.path.replace(/\\/g, "/"),
                is_main: false
            });
        });
        await Promise.all(imagePromises);
    }

    res.status(201).json(product);
  } catch (error) {
    // Cleanup uploaded files if error
    if (req.files) {
        Object.values(req.files).flat().forEach(file => {
             try { fs.unlinkSync(file.path); } catch(e) {}
        });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
        include: [
            { model: Category, as: 'category' },
            { model: ProductImage, as: 'images' }
        ]
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
        include: [
            { model: Category, as: 'category' },
            { model: ProductImage, as: 'images' }
        ]
    });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updates = { ...req.body };
    
    // Handle JSON parsing
    if (updates.specifications_json && typeof updates.specifications_json === 'string') {
        try {
            updates.specifications_json = JSON.parse(updates.specifications_json);
        } catch (e) {
             console.error("Failed to parse specifications_json", e);
        }
    }

    // Handle Main Image Update
    if (req.files && req.files['main_image'] && req.files['main_image'][0]) {
        // Delete old image
        if (product.main_image) {
             try { fs.unlinkSync(path.resolve(product.main_image)); } catch(e) {}
        }
        updates.main_image = req.files['main_image'][0].path.replace(/\\/g, "/");
    }

    await product.update(updates);

    // Handle New Additional Images
    if (req.files && req.files['images']) {
         const imagePromises = req.files['images'].map(file => {
            return ProductImage.create({
                product_id: product.id,
                image_path: file.path.replace(/\\/g, "/"),
                is_main: false
            });
        });
        await Promise.all(imagePromises);
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
        include: [{ model: ProductImage, as: 'images' }]
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete main image
    if (product.main_image) {
         try { fs.unlinkSync(path.resolve(product.main_image)); } catch(e) {}
    }

    // Delete associated images
    if (product.images && product.images.length > 0) {
        product.images.forEach(img => {
            try { fs.unlinkSync(path.resolve(img.image_path)); } catch(e) {}
        });
    }

    // Product images will be deleted from DB via cascade if set, but Sequelize default doesn't always cascade delete on destroy unless configured.
    // Let's manually delete them to be safe or rely on DB constraint. 
    // Sequelize `destroy` handles associations if `cascade: true` or `hooks: true` is set, but we didn't explicitly set it.
    // It's safer to delete images from DB first.
    await ProductImage.destroy({ where: { product_id: product.id } });

    await product.destroy();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
