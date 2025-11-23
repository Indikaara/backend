const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    },
    txnid: {
        type: String,
        unique: true,
        sparse: true,
    },
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
            },
            price: {
                type: Number,
                required: true,
            },
        }
    ],
    shippingAddress: {
        address: String,
        city: String,
        state: String,
        postalCode: String,
        country: String,
    },
    paymentMethod: {
        type: String, // only 'payu' supported
        required: true,
        enum: ['payu']
    },
    paymentResult: {
        id: String,
        status: String,
        update_time: String,
        email_address: String,
    },
    totalPrice: {
        type: Number,
        required: true,
    },
    isPaid: {
        type: Boolean,
        default: false,
    },
    paidAt: {
        type: Date,
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending',
    },
}, {
    timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
