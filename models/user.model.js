const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address'],
    },
    phone: {
        type: String,
        required: false,
        match: [/^\d{10}$/, 'Please fill a valid phone number'],
    },
    password: {
        type: String,
        // Password is not required if logging in with Google
        required: function() { return !this.googleId; }
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true // Allows multiple documents to have a null value
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    isDemo: {
        type: Boolean,
        default: false,
    },
    shippingAddresses: [{
        address: String,
        city: String,
        state: String,
        postalCode: String,
        country: String,
        isDefault: { type: Boolean, default: false }
    }]
}, {
    timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password') || !this.password) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = { User };
