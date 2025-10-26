import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './database/db.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { app, server } from './socket/socket.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import {
    helmetConfig,
    mongoSanitizeConfig,
    errorHandler,
    notFoundHandler,
    corsOptions,
    apiLimiter
} from './middlewares/security.js';
import { sanitizeInput } from './middlewares/validation.js';
import blockchainService from './services/blockchainService.js';
import pinataService from './services/pinataService.js';

// Load environment variables
dotenv.config();

// Security Middleware
app.use(helmetConfig);
app.use(mongoSanitizeConfig);

// CORS
app.use(cors(corsOptions));

// Body parsers
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Input sanitization
app.use(sanitizeInput);

// Rate limiting for API routes
app.use('/api/', apiLimiter);

const PORT = process.env.PORT || 5000;

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        status: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Blockchain and Pinata status endpoint
app.get('/api/status', async (req, res) => {
    try {
        const blockchainStats = await blockchainService.getContractStats();
        const pinataStatus = await pinataService.testConnection();

        res.json({
            blockchain: {
                connected: true,
                network: 'Sepolia',
                contract: process.env.CONTRACT_ADDRESS,
                stats: blockchainStats
            },
            ipfs: {
                connected: pinataStatus,
                provider: 'Pinata'
            },
            database: {
                connected: true,
                type: 'MongoDB Atlas'
            }
        });
    } catch (error) {
        res.status(500).json({
            error: 'Unable to fetch status',
            message: error.message
        });
    }
});

// API Routes
app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/post', postRoutes);
app.use('/api/message', messageRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    const __dirname = path.resolve();
    app.use(express.static(path.join(__dirname, "/frontend/dist")));

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
    });
}

// 404 Handler
app.use(notFoundHandler);

// Error Handler (must be last)
app.use(errorHandler);

// Initialize services and start server
async function startServer() {
    try {
        // Connect to MongoDB
        await connectDB();
        console.log('✅ MongoDB connected successfully');

        // Initialize blockchain service
        await blockchainService.initialize();
        console.log('✅ Blockchain service initialized');

        // Test Pinata connection
        const pinataConnected = await pinataService.testConnection();
        if (pinataConnected) {
            console.log('✅ Pinata IPFS connected successfully');
        } else {
            console.warn('⚠️  Pinata connection warning - check credentials');
        }

        // Start server
        server.listen(PORT, () => {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔗 Blockchain: Sepolia Testnet`);
            console.log(`📦 IPFS: Pinata`);
            console.log(`💾 Database: MongoDB Atlas`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    server.close(() => process.exit(1));
});

export { app, server };
