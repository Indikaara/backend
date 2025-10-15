const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    price: [{
        size: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
    }],
    image: [{
        type: String,
        required: true,
    }],
    story: {
        type: String,
    },
    description: {
        type: String,
        required: true,
    },
    details: [{
        type: String,
    }],
    color: [{
        type: String,
    }],
    weavingTechnique: {
        type: String,
    },
    material: {
        type: [String],
    },
    manufacturer: {
        type: String,
        required: true,
    },
    tags: [{
        type: String,
    }],
    SKU: {
        type: String,
        required: true,
        unique: true,
    },
    category: {
        type: String,
        required: true,
    },
    categoryId: {
        type: Number,
        required: true,
    },
}, {
    timestamps: true,
});

const Product = mongoose.model('Product', productSchema);
module.exports = { Product };
