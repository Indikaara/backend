const axios = require('axios');
const crypto = require('crypto');

// @desc    Initiate PayU Payment
// @route   POST /api/products/payu-payment
exports.initiatePayUPayment = async (req, res) => {
    /*
      Required fields from frontend:
      amount, productinfo, firstname, email, phone, txnid (unique), surl, furl
    */
    const { amount, productinfo, firstname, email, phone, txnid, surl, furl } = req.body;
    const key = process.env.PAYU_MERCHANT_KEY;
    const salt = process.env.PAYU_MERCHANT_SALT;
    const payuBaseUrl = process.env.PAYU_BASE_URL || 'https://test.payu.in';
    if (!key || !salt) {
        return res.status(500).json({ message: 'PayU credentials not set' });
    }
    // Generate hash string
    const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;
    const hash = crypto.createHash('sha512').update(hashString).digest('hex');
    // Prepare PayU payment params
    const payuParams = {
        key,
        txnid,
        amount,
        productinfo,
        firstname,
        email,
        phone,
        surl,
        furl,
        hash,
        service_provider: 'payu_paisa',
    };
    // Send params to frontend to post to PayU, or redirect from backend if desired
    res.json({
        payuUrl: `${payuBaseUrl}/_payment`,
        params: payuParams
    });
};
const Product = require('../models/product.model');

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
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
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
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
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
exports.createProduct = async (req, res) => {
    const { id, name, price, image, story, description, details, color, weavingTechnique, material, manufacturer, tags, SKU, category, categoryId } = req.body;
    try {
        const product = new Product({
            id,
            name,
            price,
            image,
            story,
            description,
            details,
            color,
            weavingTechnique,
            material,
            manufacturer,
            tags,
            SKU,
            category,
            categoryId
        });
        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(400).json({ message: 'Invalid product data' });
    }
};
