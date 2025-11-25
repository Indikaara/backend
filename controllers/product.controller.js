const Product = require('../models/product.model').Product;
const { logger } = require('../config/logger');
const { AppError } = require('../utils/error-utils');

// @desc    Get all products with optional filtering
// @route   GET /api/products
exports.getProducts = async (req, res, next) => {
    try {
        const filters = {};
        
        // Apply filters if provided
        if (req.query.category) filters.category = req.query.category;
        if (req.query.manufacturer) filters.manufacturer = req.query.manufacturer;
        if (req.query.minPrice || req.query.maxPrice) {
            filters['price.amount'] = {};
            if (req.query.minPrice) filters['price.amount'].$gte = Number(req.query.minPrice);
            if (req.query.maxPrice) filters['price.amount'].$lte = Number(req.query.maxPrice);
        }

        const products = await Product.find(filters);
        
        if (!products || products.length === 0) {
            return next(new AppError('No products found', 404));
        }

        logger.info('Products retrieved successfully', {
            count: products.length,
            filters: Object.keys(filters)
        });

        res.json(products);
    } catch (error) {
        logger.error('Error retrieving products', {
            error: error.message,
            filters: req.query
        });
        next(error);
    }
};

// @desc    Get all products
// @route   GET /api/products
exports.getAllProducts = async (req, res, next) => {
    try {
        const products = await Product.find({});
        
        if (!products || products.length === 0) {
            return next(new AppError('No products found', 404));
        }

        logger.info('All products retrieved successfully', {
            count: products.length
        });

        res.json(products);
    } catch (error) {
        logger.error('Error retrieving all products', {
            error: error.message
        });
        next(error);
    }
};

// @desc    Get a single product by ID
// @route   GET /api/products/:id
exports.getProductById = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return next(new AppError('Product not found', 404));
        }

        logger.info('Product retrieved successfully', {
            productId: req.params.id
        });

        res.json(product);
    } catch (error) {
        logger.error('Error retrieving product', {
            productId: req.params.id,
            error: error.message
        });
        next(error);
    }
};

// @desc    Create a new product (Protected)
// @route   POST /api/products
exports.createProduct = async (req, res, next) => {
    try {
        // Validate required fields
        const requiredFields = ['id', 'name', 'price', 'image', 'description', 'manufacturer', 'SKU', 'category', 'categoryId'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return next(new AppError(`Missing required fields: ${missingFields.join(', ')}`, 400));
        }

        const { 
            id, name, price, image, story, description, details, 
            color, weavingTechnique, material, manufacturer, 
            tags, SKU, category, categoryId 
        } = req.body;

        // Validate price structure
        if (!Array.isArray(price) || !price.every(p => p.size && typeof p.amount === 'number')) {
            return next(new AppError('Invalid price format. Each price must have size and amount', 400));
        }

        const product = new Product({
            id, name, price, image, story, description, details,
            color, weavingTechnique, material, manufacturer,
            tags, SKU, category, categoryId
        });

        const createdProduct = await product.save();

        logger.info('Product created successfully', {
            productId: createdProduct._id,
            name: createdProduct.name,
            category: createdProduct.category
        });

        res.status(201).json(createdProduct);
    } catch (error) {
        logger.error('Error creating product', {
            payload: req.body,
            error: error.message
        });

        // Check if it's a MongoDB duplicate key error
        if (error.code === 11000) {
            return next(new AppError('A product with this ID or SKU already exists', 400));
        }

        next(error);
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
exports.updateProduct = async (req, res, next) => {
    try {
        // If price is being updated, validate its structure
        if (req.body.price) {
            if (!Array.isArray(req.body.price) || !req.body.price.every(p => p.size && typeof p.amount === 'number')) {
                return next(new AppError('Invalid price format. Each price must have size and amount', 400));
            }
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { 
                new: true,
                runValidators: true,
                context: 'query'
            }
        );

        if (!product) {
            return next(new AppError('Product not found', 404));
        }

        logger.info('Product updated successfully', {
            productId: req.params.id,
            updatedFields: Object.keys(req.body)
        });

        res.json(product);
    } catch (error) {
        logger.error('Error updating product', {
            productId: req.params.id,
            payload: req.body,
            error: error.message
        });

        // Check if it's a MongoDB duplicate key error
        if (error.code === 11000) {
            return next(new AppError('Update would create a duplicate ID or SKU', 400));
        }

        next(error);
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
exports.deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return next(new AppError('Product not found', 404));
        }

        await product.remove();

        logger.info('Product deleted successfully', {
            productId: req.params.id,
            productName: product.name
        });

        res.json({ message: 'Product removed' });
    } catch (error) {
        logger.error('Error deleting product', {
            productId: req.params.id,
            error: error.message
        });
        next(error);
    }
};
