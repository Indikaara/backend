const { Product } = require('../models/product.model');
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
/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   id:
 *                     type: number
 *                   name:
 *                     type: string
 *                   price:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         size:
 *                           type: string
 *                         amount:
 *                           type: number
 *                   image:
 *                     type: array
 *                     items:
 *                       type: string
 *                   story:
 *                     type: string
 *                   description:
 *                     type: string
 *                   details:
 *                     type: array
 *                     items:
 *                       type: string
 *                   color:
 *                     type: array
 *                     items:
 *                       type: string
 *                   weavingTechnique:
 *                     type: string
 *                   material:
 *                     type: string
 *                   manufacturer:
 *                     type: string
 *                   tags:
 *                     type: array
 *                     items:
 *                       type: string
 *                   SKU:
 *                     type: string
 *                   category:
 *                     type: string
 *                   categoryId:
 *                     type: number
 *                   createdAt:
 *                     type: string
 *                   updatedAt:
 *                     type: string
 *       500:
 *         description: Server error
 */
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
/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 id:
 *                   type: number
 *                 name:
 *                   type: string
 *                 price:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       size:
 *                         type: string
 *                       amount:
 *                         type: number
 *                 image:
 *                   type: array
 *                   items:
 *                     type: string
 *                 story:
 *                   type: string
 *                 description:
 *                   type: string
 *                 details:
 *                   type: array
 *                   items:
 *                     type: string
 *                 color:
 *                   type: array
 *                   items:
 *                     type: string
 *                 weavingTechnique:
 *                   type: string
 *                 material:
 *                   type: string
 *                 manufacturer:
 *                   type: string
 *                 tags:
 *                   type: array
 *                   items:
 *                     type: string
 *                 SKU:
 *                   type: string
 *                 category:
 *                   type: string
 *                 categoryId:
 *                   type: number
 *                 createdAt:
 *                   type: string
 *                 updatedAt:
 *                   type: string
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
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
/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - name
 *               - price
 *               - image
 *               - description
 *               - manufacturer
 *               - SKU
 *               - category
 *               - categoryId
 *             properties:
 *               id:
 *                 type: number
 *               name:
 *                 type: string
 *               price:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     size:
 *                       type: string
 *                     amount:
 *                       type: number
 *               image:
 *                 type: array
 *                 items:
 *                   type: string
 *               story:
 *                 type: string
 *               description:
 *                 type: string
 *               details:
 *                 type: array
 *                 items:
 *                   type: string
 *               color:
 *                 type: array
 *                 items:
 *                   type: string
 *               weavingTechnique:
 *                 type: string
 *               material:
 *                 type: array
 *                 items:
 *                   type: string
 *               manufacturer:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               SKU:
 *                 type: string
 *               category:
 *                 type: string
 *               categoryId:
 *                 type: number
 *           examples:
 *             demo:
 *               value:
 *                 id: 1
 *                 name: 'Demo Product'
 *                 price:
 *                   - size: 'M'
 *                     amount: 100
 *                 image:
 *                   - 'https://example.com/image.jpg'
 *                 description: 'A demo product'
 *                 manufacturer: 'Demo Maker'
 *                 SKU: 'DEMO-001'
 *                 category: 'textiles'
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 id:
 *                   type: number
 *                 name:
 *                   type: string
 *                 price:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       size:
 *                         type: string
 *                       amount:
 *                         type: number
 *                 image:
 *                   type: array
 *                   items:
 *                     type: string
 *                 story:
 *                   type: string
 *                 description:
 *                   type: string
 *                 details:
 *                   type: array
 *                   items:
 *                     type: string
 *                 color:
 *                   type: array
 *                   items:
 *                     type: string
 *                 weavingTechnique:
 *                   type: string
 *                 material:
 *                   type: string
 *                 manufacturer:
 *                   type: string
 *                 tags:
 *                   type: array
 *                   items:
 *                     type: string
 *                 SKU:
 *                   type: string
 *                 category:
 *                   type: string
 *                 categoryId:
 *                   type: number
 *                 createdAt:
 *                   type: string
 *                 updatedAt:
 *                   type: string
 *       400:
 *         description: Invalid product data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
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
