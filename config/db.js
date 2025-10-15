const mongoose = require('mongoose');
const { logger } = require('./logger');

const connectDB = async () => {
    try {
        mongoose.set('strictQuery', false);
        
        // Determine database name based on environment
        const dbName = 'production';

        // Extract base URI (everything before the query parameters)
        const baseUri = process.env.MONGO_URI.split('?')[0];
        const queryParams = process.env.MONGO_URI.split('?')[1] || '';
        
        // Construct full URI with explicit database name
        const fullUri = `${baseUri.replace(/\/([^/]*)$/, '')}/${dbName}?${queryParams}`;
        
        const conn = await mongoose.connect(fullUri);
        
        logger.info('MongoDB Connected', {
            host: conn.connection.host,
            database: conn.connection.name,
            environment: process.env.NODE_ENV
        });
    } catch (err) {
        logger.error('Database connection error', {
            error: err.message,
            stack: err.stack,
            environment: process.env.NODE_ENV
        });
        process.exit(1);
    }
};

module.exports = connectDB;
