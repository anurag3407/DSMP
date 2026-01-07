const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const Like = require('../models/Like');
const { auth } = require('../middleware/auth');

// Get personalized feed
router.get('/', auth, async (req, res) => {
    console.log('[DEBUG] GET /feed - user:', req.user?.walletAddress);
    try {
        const { page = 1, limit = 20 } = req.query;
        const userAddress = req.user.walletAddress;

        const posts = await Post.find({ isDeleted: false })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const enriched = await Promise.all(posts.map(async (post) => {
            const author = await User.findOne({ walletAddress: post.author });
            const hasLiked = await Like.findOne({ postId: post._id, userAddress });

            return {
                ...post.toObject(),
                authorUsername: author?.username || post.author.slice(0, 8) + '...',
                authorAvatarCID: author?.avatarCID || '',
                hasLiked: !!hasLiked
            };
        }));

        const total = await Post.countDocuments({ isDeleted: false });
        console.log('[DEBUG] GET /feed - Found:', enriched.length, 'posts');
        res.json({ posts: enriched, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
    } catch (error) {
        console.error('[DEBUG] GET /feed ERROR:', error);
        res.status(500).json({ error: 'Failed to get feed' });
    }
});

// Get explore feed (public)
router.get('/explore', async (req, res) => {
    console.log('[DEBUG] GET /feed/explore');
    try {
        const { page = 1, limit = 20 } = req.query;
        const posts = await Post.find({ isDeleted: false })
            .sort({ likesCount: -1, createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const enriched = await Promise.all(posts.map(async (post) => {
            const author = await User.findOne({ walletAddress: post.author });
            return {
                ...post.toObject(),
                authorUsername: author?.username || post.author.slice(0, 8) + '...'
            };
        }));

        const total = await Post.countDocuments({ isDeleted: false });
        console.log('[DEBUG] GET /feed/explore - Found:', enriched.length);
        res.json({ posts: enriched, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
    } catch (error) {
        console.error('[DEBUG] GET /feed/explore ERROR:', error);
        res.status(500).json({ error: 'Failed to get explore feed' });
    }
});

module.exports = router;
