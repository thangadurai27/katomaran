const mongoose = require('mongoose');
const logger = require('../utils/logger');

// Fail fast when DB is down (avoid 10s "buffering timed out" → 500)
mongoose.set('bufferCommands', false);

let isConnecting = false;
let connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 5;

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

/**
 * Wait for MongoDB connection with retry logic
 * Returns true when connected, false when max retries exceeded
 */
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

    // If already connected, return success
    if (mongoose.connection.readyState === 1) {
        logger.info('MongoDB already connected');
        return true;
    }

    // If already connecting, wait for existing connection to complete
    if (isConnecting) {
        logger.info('MongoDB connection already in progress, waiting...');
        return new Promise((resolve) => {
            const checkConnection = async () => {
                if (mongoose.connection.readyState === 1) {
                    resolve(true);
                } else if (mongoose.connection.readyState === 0 || mongoose.connection.readyState === 3) {
                    // Not connected or disconnected, try again
                    logger.info('Connection not ready, retrying...');
                    setTimeout(checkConnection, 1000);
                }
            };
            checkConnection();
        });
    }

    isConnecting = true;
    connectionAttempts++;

    logger.info(`MongoDB connection attempt #${connectionAttempts}`);

    try {
        const options = {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 20000,
            socketTimeoutMS: 45000,
            family: 4, // Use IPv4, avoid IPv6 issues on some platforms
        };
        if (process.env.MONGODB_DB_NAME) {
            options.dbName = process.env.MONGODB_DB_NAME;
        }

        const conn = await mongoose.connect(uri, options);

        logger.info(`MongoDB Connected: ${conn.connection.host}`);
        logger.info(`Database: ${conn.connection.name}`);
        isConnecting = false;
        connectionAttempts = 0;
        return true;
    } catch (error) {
        logger.error(`MongoDB connection failed: ${error.message}`);
        isConnecting = false;
        connectionAttempts = 0;

        // Check if it's a password encoding issue
        if (error.message.includes('authentication') || error.message.includes('ATLAS')) {
            logger.error(' likely password encoding issue - check MONGODB_URI @ characters');
        }

        return false;
    }
};

/**
 * Graceful reconnection manager
 * Tries to reconnect at most MAX_CONNECTION_ATTEMPTS times
 */
const scheduleReconnect = () => {
    let reconnectAttempts = 0;

    const attemptReconnect = async () => {
        reconnectAttempts++;
        if (reconnectAttempts > MAX_CONNECTION_ATTEMPTS) {
            logger.error('Max reconnection attempts exceeded. Server may operate in degraded mode.');
            return;
        }

        if (mongoose.connection.readyState !== 1) {
            logger.info(`Attempting reconnection #${reconnectAttempts}...`);
            await connectDB();
        }
    };

    // Set up interval for reconnection attempts
    const intervalId = setInterval(async () => {
        try {
            await attemptReconnect();
        } catch (e) {
            logger.error('Error during reconnection attempt:', e);
        }
    }, 30000);

    // Also attempt immediate reconnect if DB is disconnected
    if (mongoose.connection.readyState !== 1) {
        attemptReconnect().catch(() => {});
    }

    // Return function to clear interval if needed
    return () => clearInterval(intervalId);
};

scheduleReconnect();

mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected - will attempt reconnection');
});

mongoose.connection.on('error', (err) => {
    logger.error(`MongoDB connection error: ${err.message}`);
});

mongoose.connection.on('connected', () => {
    logger.info('MongoDB connection established successfully');
});

mongoose.connection.on('open', () => {
    logger.info('MongoDB connection open');
});

module.exports = connectDB;
