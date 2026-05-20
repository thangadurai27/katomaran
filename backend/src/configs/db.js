const mongoose = require('mongoose');
const logger = require('../utils/logger');

// Fail fast when DB is down (avoid 10s "buffering timed out" → 500)
mongoose.set('bufferCommands', false);

let isConnecting = false;

const connectDB = async () => {
    if (!process.env.MONGODB_URI) {
        logger.error('MONGODB_URI is not set — API will run but database features will fail');
        return false;
    }

    if (mongoose.connection.readyState === 1) return true;
    if (isConnecting) return false;

    isConnecting = true;

    try {
        const options = {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 20000,
            socketTimeoutMS: 45000,
        };
        if (process.env.MONGODB_DB_NAME) {
            options.dbName = process.env.MONGODB_DB_NAME;
        }

        const conn = await mongoose.connect(process.env.MONGODB_URI, options);

        logger.info(`MongoDB Connected: ${conn.connection.host}`);
        return true;
    } catch (error) {
        logger.error(`MongoDB connection failed: ${error.message}`);
        return false;
    } finally {
        isConnecting = false;
    }
};

mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
    logger.error(`MongoDB connection error: ${err.message}`);
});

const scheduleReconnect = () => {
    setInterval(async () => {
        if (mongoose.connection.readyState !== 1) {
            await connectDB();
        }
    }, 30000);
};

scheduleReconnect();

module.exports = connectDB;
