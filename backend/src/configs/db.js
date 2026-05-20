const mongoose = require('mongoose');
const logger = require('../utils/logger');

// Fail fast when DB is down (avoid 10s "buffering timed out" → 500)
mongoose.set('bufferCommands', false);

let isConnecting = false;

/** Detect unencoded @ in password (common Render misconfiguration) */
const validateMongoUri = (uri) => {
    const match = uri.match(/^mongodb(\+srv)?:\/\/([^@]+)@(.+)$/i);
    if (!match) return null;
    const creds = match[2];
    const hostPart = match[3];
    if (creds.includes('@')) {
        return 'Password contains "@". In MONGODB_URI encode it as %40 (e.g. Snaplink@123 → Snaplink%40123).';
    }
    if (!hostPart.includes('.') || hostPart.startsWith('123')) {
        return 'MONGODB_URI host looks wrong. Use the full Atlas host: snaplink-cluster.b7j73vn.mongodb.net';
    }
    return null;
};

const connectDB = async () => {
    if (!process.env.MONGODB_URI) {
        logger.error('MONGODB_URI is not set — API will run but database features will fail');
        return false;
    }

    const uri = process.env.MONGODB_URI.trim().replace(/^["']|["']$/g, '');
    const uriError = validateMongoUri(uri);
    if (uriError) {
        logger.error(uriError);
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

        const conn = await mongoose.connect(uri, options);

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
