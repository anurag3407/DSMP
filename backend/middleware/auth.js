const jwt = require('jsonwebtoken');
const { ethers } = require('ethers');

// Verify JWT token middleware
const auth = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ error: 'No token, authorization denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token is not valid' });
    }
};

// Verify wallet signature
const verifySignature = (message, signature, expectedAddress) => {
    try {
        const recoveredAddress = ethers.utils.verifyMessage(message, signature);
        return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
    } catch (error) {
        console.error('Signature verification error:', error);
        return false;
    }
};

// Generate JWT token
const generateToken = (walletAddress) => {
    return jwt.sign(
        { walletAddress: walletAddress.toLowerCase() },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
    );
};

module.exports = { auth, verifySignature, generateToken };
