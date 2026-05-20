require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const path = require('path');

const connectDB = require('./configs/db');
const { initializeSocket } = require('./sockets/socketManager');
const logger = require('./utils/logger');
const { generalLimiter } = require('./middlewares/rateLimiter');
const errorHandler = require('./middlewares/errorHandler');

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

// Initialize Socket.io
const io = initializeSocket(server);

// Make io available to routes
app.set('io', io);

// Connect Database
connectDB();

// Security Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false
}));

// CORS
app.use(cors({
    origin: [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Rate Limiting
app.use('/api/', generalLimiter);

// Static Files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health Check
app.get('/health', (req, res) => {
    res.json({
        status: 'UP',
        service: 'SnapLink AI API',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// API Routes
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

// Redirect Route (short URL resolution)
app.use('/r', redirectRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    logger.info(`🚀 SnapLink AI Server running on port ${PORT}`);
    logger.info(`🌍 Environment: ${process.env.NODE_ENV}`);
    logger.info(`📡 Socket.io initialized`);
});

// Handle Unhandled Promise Rejections
process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled Promise Rejection: ${err.message}`);
    server.close(() => process.exit(1));
});

module.exports = { app, server };
