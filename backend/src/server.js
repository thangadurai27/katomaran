require('dotenv').config();

const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const path = require('path');

const connectDB = require('./configs/db');
const { initializeSocket } = require('./sockets/socketManager');
const logger = require('./utils/logger');
const { getCorsOrigins } = require('./utils/corsOrigins');
const { generalLimiter } = require('./middlewares/rateLimiter');
const errorHandler = require('./middlewares/errorHandler');
const requireDb = require('./middlewares/requireDb');

// Import Routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const linkRoutes = require('./routes/link.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const aiRoutes = require('./routes/ai.routes');
const qrRoutes = require('./routes/qr.routes');
const campaignRoutes = require('./routes/campaign.routes');
const teamRoutes = require('./routes/team.routes');
const notificationRoutes = require('./routes/notification.routes');
const activityRoutes = require('./routes/activity.routes');
const adminRoutes = require('./routes/admin.routes');
const bioRoutes = require('./routes/bio.routes');
const bulkRoutes = require('./routes/bulk.routes');
const exportRoutes = require('./routes/export.routes');
const redirectRoutes = require('./routes/redirect.routes');
const statsRoutes = require('./routes/stats.routes');

const app = express();
const server = http.createServer(app);

// Render / reverse proxy
app.set('trust proxy', 1);

const logMissingEnv = () => {
    const required = ['MONGODB_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
    for (const key of required) {
        if (!process.env[key]) {
            logger.warn(`Missing environment variable: ${key}`);
        }
    }
    if (!process.env.FRONTEND_URL && !process.env.CLIENT_URL) {
        logger.warn('Set FRONTEND_URL or CLIENT_URL for CORS (your Vercel URL)');
    }
};

logMissingEnv();

// Initialize Socket.io
const io = initializeSocket(server);
app.set('io', io);

// Security Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false
}));

app.use(cors({
    origin: getCorsOrigins(),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(compression());

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use('/api/', generalLimiter);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Root — Render health / browser check
app.get('/', (req, res) => {
    res.send('SnapLink AI Backend Running');
});

app.get('/health', (req, res) => {
    const mongoReady = mongoose.connection.readyState === 1;
    res.status(200).json({
        status: 'UP',
        service: 'SnapLink AI API',
        mongo: mongoReady ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// API Routes (require MongoDB)
app.use('/api', requireDb);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bio', bioRoutes);
app.use('/api/bulk', bulkRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/stats', statsRoutes);
app.use('/r', redirectRoutes);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

// Start the HTTP server FIRST so Render's port scan detects an open port immediately.
// MongoDB connection happens asynchronously afterwards - it must not block port binding.
const startServer = async () => {
    server.listen(PORT, HOST, () => {
        logger.info(`SnapLink AI Server running on ${HOST}:${PORT}`);
        logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
        logger.info(`MongoDB readyState: ${mongoose.connection.readyState}`);
    });

    // Connect to MongoDB asynchronously after the server is listening.
    // Do not await this - the server must be available even if MongoDB is down.
    connectDB().then((dbConnected) => {
        if (dbConnected) {
            logger.info('MongoDB connected - API routes will function normally');
        } else {
            logger.warn('MongoDB not connected - API routes requiring database will return 503');
        }
    }).catch((err) => {
        logger.error(`MongoDB connection error: ${err.message}`);
    });
};

startServer().catch((err) => {
    logger.error(`Failed to start server: ${err.message}`);
    // Even if server start fails, try to listen so we don't lose the port
    server.listen(PORT, HOST, () => {
        logger.warn('Server listening without confirmed MongoDB connection');
    });
});

process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled Promise Rejection: ${err.message}`);
    // Attempt to reconnect to MongoDB
    connectDB().catch((e) => logger.error('Failed to reconnect to MongoDB:', e.message));
});

process.on('uncaughtException', (err) => {
    logger.error(`Uncaught Exception: ${err.stack || err.message}`);
});

module.exports = { app, server };
