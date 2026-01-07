const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const { verifySignature, generateToken } = require('../middleware/auth');

// Get nonce for wallet signature
router.get('/nonce/:walletAddress', async (req, res) => {
    console.log('[DEBUG] GET /auth/nonce - walletAddress:', req.params.walletAddress);
    try {
        const { walletAddress } = req.params;

        if (!walletAddress) {
            console.log('[DEBUG] GET /auth/nonce - ERROR: No wallet address');
            return res.status(400).json({ error: 'Wallet address is required' });
        }

        let user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
        console.log('[DEBUG] GET /auth/nonce - User found:', !!user);

        // Generate new nonce
        const nonce = uuidv4();

        if (!user) {
            // Create new user with nonce
            user = new User({
                walletAddress: walletAddress.toLowerCase(),
                nonce
            });
            await user.save();
            console.log('[DEBUG] GET /auth/nonce - New user created');
        } else {
            // Update existing user's nonce
            user.nonce = nonce;
            await user.save();
            console.log('[DEBUG] GET /auth/nonce - User nonce updated');
        }

        res.json({
            nonce,
            message: `Sign this message to authenticate with DSMP:\n\nNonce: ${nonce}`
        });
    } catch (error) {
        console.error('[DEBUG] GET /auth/nonce ERROR:', error);
        res.status(500).json({ error: 'Failed to generate nonce' });
    }
});

// Login with wallet signature
router.post('/login', async (req, res) => {
    console.log('[DEBUG] POST /auth/login - body:', req.body);
    try {
        const { walletAddress, signature } = req.body;

        if (!walletAddress || !signature) {
            console.log('[DEBUG] POST /auth/login - ERROR: Missing params');
            return res.status(400).json({ error: 'Wallet address and signature are required' });
        }

        const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
        console.log('[DEBUG] POST /auth/login - User found:', !!user);

        if (!user) {
            return res.status(404).json({ error: 'User not found. Please get a nonce first.' });
        }

        // Verify the signature
        const message = `Sign this message to authenticate with DSMP:\n\nNonce: ${user.nonce}`;
        const isValid = verifySignature(message, signature, walletAddress);
        console.log('[DEBUG] POST /auth/login - Signature valid:', isValid);

        if (!isValid) {
            return res.status(401).json({ error: 'Invalid signature' });
        }

        // Generate new nonce for next login (prevents replay attacks)
        user.nonce = uuidv4();
        await user.save();

        // Generate JWT token
        const token = generateToken(walletAddress);
        console.log('[DEBUG] POST /auth/login - Token generated successfully');

        res.json({
            token,
            user: {
                walletAddress: user.walletAddress,
                username: user.username,
                bio: user.bio,
                avatarCID: user.avatarCID,
                isOnChain: user.isOnChain
            }
        });
    } catch (error) {
        console.error('[DEBUG] POST /auth/login ERROR:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Verify token
router.get('/verify', async (req, res) => {
    console.log('[DEBUG] GET /auth/verify - headers:', req.headers.authorization ? 'present' : 'missing');
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ valid: false });
        }

        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        console.log('[DEBUG] GET /auth/verify - Token decoded:', decoded.walletAddress);

        const user = await User.findOne({ walletAddress: decoded.walletAddress });

        if (!user) {
            return res.status(401).json({ valid: false });
        }

        res.json({
            valid: true,
            user: {
                walletAddress: user.walletAddress,
                username: user.username,
                bio: user.bio,
                avatarCID: user.avatarCID,
                isOnChain: user.isOnChain
            }
        });
    } catch (error) {
        console.error('[DEBUG] GET /auth/verify ERROR:', error);
        res.status(401).json({ valid: false });
    }
});

module.exports = router;
