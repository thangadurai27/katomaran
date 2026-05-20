const { Server } = require('socket.io');
const { verifyAccessToken } = require('../utils/jwt.utils');
const User = require('../models/User.model');
const logger = require('../utils/logger');
const { getCorsOrigins } = require('../utils/corsOrigins');

let io;

const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: getCorsOrigins(),
            methods: ['GET', 'POST'],
            credentials: true
        },
        pingTimeout: 60000
    });

    // Authentication middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
            if (!token) return next(new Error('Authentication required'));

            const decoded = verifyAccessToken(token);
            const user = await User.findById(decoded.id).select('_id name email');
            if (!user) return next(new Error('User not found'));

            socket.user = user;
            next();
        } catch (err) {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        const userId = socket.user._id.toString();
        logger.info(`Socket connected: ${socket.id} (User: ${userId})`);

        // Join personal room
        socket.join(`user:${userId}`);

        // Join link rooms for tracking
        socket.on('join:link', (linkId) => {
            socket.join(`link:${linkId}`);
        });

        socket.on('leave:link', (linkId) => {
            socket.leave(`link:${linkId}`);
        });

        socket.on('disconnect', () => {
            logger.info(`Socket disconnected: ${socket.id}`);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) throw new Error('Socket.io not initialized');
    return io;
};

const emitToUser = (userId, event, data) => {
    if (io) io.to(`user:${userId}`).emit(event, data);
};

const emitToAll = (event, data) => {
    if (io) io.emit(event, data);
};

module.exports = { initializeSocket, getIO, emitToUser, emitToAll };
