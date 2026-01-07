const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Like = require('../models/Like');
const Comment = require('../models/Comment');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Create a new post
router.post('/', auth, async (req, res) => {
    console.log('[DEBUG] POST /posts - body:', req.body, 'user:', req.user?.walletAddress);
    try {
        const { content, contentCID, isOnChain, onChainId, txHash } = req.body;
        const author = req.user.walletAddress;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ error: 'Content is required' });
        }

        const post = new Post({
            author,
            content: content.trim(),
            contentCID: contentCID || '',
            isOnChain: isOnChain || false,
            onChainId: onChainId,
            txHash: txHash || ''
        });

        await post.save();
        console.log('[DEBUG] POST /posts - Created post:', post._id);
        res.status(201).json(post);
    } catch (error) {
        console.error('[DEBUG] POST /posts ERROR:', error);
        res.status(500).json({ error: 'Failed to create post' });
    }
});

// Get single post
router.get('/:id', async (req, res) => {
    console.log('[DEBUG] GET /posts/:id -', req.params.id);
    try {
        const post = await Post.findById(req.params.id);

        if (!post || post.isDeleted) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const author = await User.findOne({ walletAddress: post.author });
        res.json({
            ...post.toObject(),
            authorUsername: author?.username || post.author.slice(0, 8) + '...'
        });
    } catch (error) {
        console.error('[DEBUG] GET /posts/:id ERROR:', error);
        res.status(500).json({ error: 'Failed to get post' });
    }
});

// Update post (owner only)
router.put('/:id', auth, async (req, res) => {
    console.log('[DEBUG] PUT /posts/:id -', req.params.id, 'user:', req.user?.walletAddress);
    try {
        const { content } = req.body;
        const post = await Post.findById(req.params.id);

        if (!post || post.isDeleted) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (post.author !== req.user.walletAddress) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        if (content !== undefined && content.trim().length > 0) {
            post.content = content.trim();
        }
        await post.save();
        console.log('[DEBUG] PUT /posts/:id - Updated');
        res.json(post);
    } catch (error) {
        console.error('[DEBUG] PUT /posts/:id ERROR:', error);
        res.status(500).json({ error: 'Failed to update post' });
    }
});

// Delete post (owner only)
router.delete('/:id', auth, async (req, res) => {
    console.log('[DEBUG] DELETE /posts/:id -', req.params.id, 'user:', req.user?.walletAddress);
    try {
        const post = await Post.findById(req.params.id);

        if (!post || post.isDeleted) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (post.author !== req.user.walletAddress) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        post.isDeleted = true;
        await post.save();
        console.log('[DEBUG] DELETE /posts/:id - Deleted');
        res.json({ message: 'Post deleted' });
    } catch (error) {
        console.error('[DEBUG] DELETE /posts/:id ERROR:', error);
        res.status(500).json({ error: 'Failed to delete post' });
    }
});

// Get posts by user
router.get('/user/:walletAddress', async (req, res) => {
    console.log('[DEBUG] GET /posts/user/:walletAddress -', req.params.walletAddress);
    try {
        const { page = 1, limit = 20 } = req.query;
        const posts = await Post.find({
            author: req.params.walletAddress.toLowerCase(),
            isDeleted: false
        })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Post.countDocuments({
            author: req.params.walletAddress.toLowerCase(),
            isDeleted: false
        });

        console.log('[DEBUG] GET /posts/user - Found:', posts.length);
        res.json({ posts, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
    } catch (error) {
        console.error('[DEBUG] GET /posts/user ERROR:', error);
        res.status(500).json({ error: 'Failed to get posts' });
    }
});

// Get all posts
router.get('/', async (req, res) => {
    console.log('[DEBUG] GET /posts - query:', req.query);
    try {
        const { page = 1, limit = 20 } = req.query;
        const posts = await Post.find({ isDeleted: false })
            .sort({ createdAt: -1 })
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
        console.log('[DEBUG] GET /posts - Found:', enriched.length);
        res.json({ posts: enriched, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
    } catch (error) {
        console.error('[DEBUG] GET /posts ERROR:', error);
        res.status(500).json({ error: 'Failed to get posts' });
    }
});

module.exports = router;
