import Joi from 'joi';
import { ethers } from 'ethers';

/**
 * Validate Ethereum wallet address
 */
const walletAddressValidator = (value, helpers) => {
    if (!ethers.isAddress(value)) {
        return helpers.error('any.invalid');
    }
    return value.toLowerCase();
};

/**
 * User registration validation
 */
export const validateRegisterUser = (req, res, next) => {
    const schema = Joi.object({
        name: Joi.string().min(2).max(50).required().trim(),
        walletAddress: Joi.string().required().custom(walletAddressValidator, 'Ethereum address validation'),
        gender: Joi.string().valid('male', 'female', 'other').required(),
    });

    const { error } = schema.validate(req.body);
    
    if (error) {
        return res.status(400).json({
            message: "Validation error",
            error: error.details[0].message
        });
    }

    next();
};

/**
 * User login validation
 */
export const validateLoginUser = (req, res, next) => {
    const schema = Joi.object({
        walletAddress: Joi.string().required().custom(walletAddressValidator, 'Ethereum address validation'),
        signature: Joi.string().required(),
        message: Joi.string().required(),
    });

    const { error } = schema.validate(req.body);
    
    if (error) {
        return res.status(400).json({
            message: "Validation error",
            error: error.details[0].message
        });
    }

    next();
};

/**
 * Post creation validation
 */
export const validateCreatePost = (req, res, next) => {
    const schema = Joi.object({
        caption: Joi.string().min(1).max(500).required().trim(),
    });

    const { error } = schema.validate(req.body);
    
    if (error) {
        return res.status(400).json({
            message: "Validation error",
            error: error.details[0].message
        });
    }

    // Validate file upload
    if (!req.file) {
        return res.status(400).json({
            message: "Media file is required"
        });
    }

    // Validate file size (max 50MB)
    if (req.file.size > 50 * 1024 * 1024) {
        return res.status(400).json({
            message: "File size must be less than 50MB"
        });
    }

    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
            message: "Invalid file type. Only images and videos are allowed"
        });
    }

    next();
};

/**
 * Comment validation
 */
export const validateComment = (req, res, next) => {
    const schema = Joi.object({
        comment: Joi.string().min(1).max(500).required().trim(),
    });

    const { error } = schema.validate(req.body);
    
    if (error) {
        return res.status(400).json({
            message: "Validation error",
            error: error.details[0].message
        });
    }

    next();
};

/**
 * Message validation
 */
export const validateMessage = (req, res, next) => {
    const schema = Joi.object({
        message: Joi.string().min(1).max(1000).required().trim(),
        receiverId: Joi.string().required(),
    });

    const { error } = schema.validate(req.body);
    
    if (error) {
        return res.status(400).json({
            message: "Validation error",
            error: error.details[0].message
        });
    }

    next();
};

/**
 * Update profile validation
 */
export const validateUpdateProfile = (req, res, next) => {
    const schema = Joi.object({
        name: Joi.string().min(2).max(50).trim().optional(),
    }).unknown(true); // Allow file upload

    const { error } = schema.validate(req.body);
    
    if (error) {
        return res.status(400).json({
            message: "Validation error",
            error: error.details[0].message
        });
    }

    // Validate file if provided
    if (req.file) {
        // Validate file size (max 10MB for profile pictures)
        if (req.file.size > 10 * 1024 * 1024) {
            return res.status(400).json({
                message: "Profile picture must be less than 10MB"
            });
        }

        // Validate file type
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedMimeTypes.includes(req.file.mimetype)) {
            return res.status(400).json({
                message: "Invalid file type. Only images are allowed for profile pictures"
            });
        }
    }

    next();
};

/**
 * MongoDB ObjectId validation
 */
export const validateObjectId = (paramName) => {
    return (req, res, next) => {
        const id = req.params[paramName];
        
        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                message: `Invalid ${paramName}`
            });
        }

        next();
    };
};

/**
 * Sanitize user input (prevent XSS)
 */
export const sanitizeInput = (req, res, next) => {
    const sanitize = (str) => {
        if (typeof str !== 'string') return str;
        
        return str
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<[^>]*>/g, '')
            .trim();
    };

    // Sanitize body
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = sanitize(req.body[key]);
            }
        });
    }

    // Sanitize query
    if (req.query) {
        Object.keys(req.query).forEach(key => {
            if (typeof req.query[key] === 'string') {
                req.query[key] = sanitize(req.query[key]);
            }
        });
    }

    next();
};
