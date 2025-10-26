import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';

/**
 * Rate limiting middleware for general API requests
 */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Strict rate limiting for authentication endpoints
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: {
        message: 'Too many login attempts, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Rate limiting for post creation
 */
export const postLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 posts per hour
    message: {
        message: 'Too many posts created, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Rate limiting for message sending
 */
export const messageLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 20, // Limit each IP to 20 messages per minute
    message: {
        message: 'Too many messages sent, please slow down.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Helmet configuration for security headers
 */
export const helmetConfig = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:", "http:"],
            connectSrc: ["'self'", "wss:", "ws:"],
            fontSrc: ["'self'", "data:"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'", "https:", "http:"],
            frameSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
});

/**
 * MongoDB injection prevention
 */
export const mongoSanitizeConfig = mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
        console.warn(`Sanitized request on key: ${key}`);
    },
});

/**
 * Error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Handle specific error types
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            message: 'Validation error',
            error: err.message
        });
    }

    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            message: 'Invalid token',
            error: 'Authentication failed'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            message: 'Token expired',
            error: 'Please login again'
        });
    }

    if (err.code === 11000) {
        return res.status(400).json({
            message: 'Duplicate entry',
            error: 'Resource already exists'
        });
    }

    if (err.name === 'CastError') {
        return res.status(400).json({
            message: 'Invalid ID format',
            error: err.message
        });
    }

    // Blockchain errors
    if (err.message && err.message.includes('Blockchain')) {
        return res.status(500).json({
            message: 'Blockchain transaction failed',
            error: err.message
        });
    }

    // Pinata/IPFS errors
    if (err.message && err.message.includes('Pinata')) {
        return res.status(500).json({
            message: 'IPFS upload failed',
            error: err.message
        });
    }

    // Default error
    res.status(err.status || 500).json({
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.stack : 'An error occurred'
    });
};

/**
 * Not found handler
 */
export const notFoundHandler = (req, res) => {
    res.status(404).json({
        message: 'Route not found',
        path: req.originalUrl
    });
};

/**
 * Async error wrapper
 */
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * CORS configuration
 */
export const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? [process.env.FRONTEND_URL, 'https://nounce.vercel.app']
        : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
