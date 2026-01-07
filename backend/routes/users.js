const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Get user profile by address
router.get('/:walletAddress', async (req, res) => {
    console.log('[DEBUG] GET /users/:walletAddress -', req.params.walletAddress);
    try {
        const user = await User.findOne({ walletAddress: req.params.walletAddress.toLowerCase() });

        if (!user) {
            console.log('[DEBUG] GET /users - Not found');
            return res.status(404).json({ error: 'User not found' });
        }

        console.log('[DEBUG] GET /users - Found user:', user.username || user.walletAddress);
        res.json({
            walletAddress: user.walletAddress,
            username: user.username,
            bio: user.bio,
            avatarCID: user.avatarCID,
            isOnChain: user.isOnChain,
            createdAt: user.createdAt
        });
    } catch (error) {
        console.error('[DEBUG] GET /users ERROR:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
});

// Update user profile
router.put('/', auth, async (req, res) => {
    console.log('[DEBUG] PUT /users - user:', req.user?.walletAddress, 'body:', req.body);
    try {
        const { username, bio, avatarCID, isOnChain } = req.body;
        const user = await User.findOne({ walletAddress: req.user.walletAddress });

        if (!user) {
            console.log('[DEBUG] PUT /users - User not found');
            return res.status(404).json({ error: 'User not found' });
        }

        if (username !== undefined) user.username = username;
        if (bio !== undefined) user.bio = bio;
        if (avatarCID !== undefined) user.avatarCID = avatarCID;
        if (isOnChain !== undefined) user.isOnChain = isOnChain;

        await user.save();
        console.log('[DEBUG] PUT /users - Updated successfully');
        res.json({
            walletAddress: user.walletAddress,
            username: user.username,
            bio: user.bio,
            avatarCID: user.avatarCID,
            isOnChain: user.isOnChain
        });
    } catch (error) {
        console.error('[DEBUG] PUT /users ERROR:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Search users
router.get('/search/:query', async (req, res) => {
    console.log('[DEBUG] GET /users/search/:query -', req.params.query);
    try {
        const users = await User.find({
            username: { $regex: req.params.query, $options: 'i' }
        })
            .select('walletAddress username bio avatarCID')
            .limit(20);

        console.log('[DEBUG] GET /users/search - Found:', users.length);
        res.json(users);
    } catch (error) {
        console.error('[DEBUG] GET /users/search ERROR:', error);
        res.status(500).json({ error: 'Failed to search users' });
    }
});

module.exports = router;
