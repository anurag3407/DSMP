const express = require('express');
const router = express.Router();
const Like = require('../models/Like');
const Post = require('../models/Post');
const { auth } = require('../middleware/auth');

// Like a post
router.post('/:postId', auth, async (req, res) => {
    console.log('[DEBUG] POST /likes/:postId -', req.params.postId, 'user:', req.user?.walletAddress);
    try {
        const { postId } = req.params;
        const userAddress = req.user.walletAddress;

        const post = await Post.findById(postId);
        if (!post || post.isDeleted) {
            console.log('[DEBUG] POST /likes - Post not found');
            return res.status(404).json({ error: 'Post not found' });
        }

        const existingLike = await Like.findOne({ postId, userAddress });
        if (existingLike) {
            console.log('[DEBUG] POST /likes - Already liked');
            return res.status(400).json({ error: 'Already liked' });
        }

        const like = new Like({ postId, userAddress });
        await like.save();
        await Post.findByIdAndUpdate(postId, { $inc: { likesCount: 1 } });
        console.log('[DEBUG] POST /likes - Liked successfully');
        res.status(201).json({ message: 'Post liked' });
    } catch (error) {
        console.error('[DEBUG] POST /likes ERROR:', error);
        res.status(500).json({ error: 'Failed to like post' });
    }
});

// Unlike a post
router.delete('/:postId', auth, async (req, res) => {
    console.log('[DEBUG] DELETE /likes/:postId -', req.params.postId, 'user:', req.user?.walletAddress);
    try {
        const { postId } = req.params;
        const userAddress = req.user.walletAddress;

        const like = await Like.findOne({ postId, userAddress });
        if (!like) {
            console.log('[DEBUG] DELETE /likes - Not liked');
            return res.status(400).json({ error: 'Not liked' });
        }

        await Like.findByIdAndDelete(like._id);
        await Post.findByIdAndUpdate(postId, { $inc: { likesCount: -1 } });
        console.log('[DEBUG] DELETE /likes - Unliked successfully');
        res.json({ message: 'Post unliked' });
    } catch (error) {
        console.error('[DEBUG] DELETE /likes ERROR:', error);
        res.status(500).json({ error: 'Failed to unlike post' });
    }
});

// Check if liked
router.get('/check/:postId', auth, async (req, res) => {
    console.log('[DEBUG] GET /likes/check/:postId -', req.params.postId);
    try {
        const like = await Like.findOne({ postId: req.params.postId, userAddress: req.user.walletAddress });
        res.json({ liked: !!like });
    } catch (error) {
        console.error('[DEBUG] GET /likes/check ERROR:', error);
        res.status(500).json({ error: 'Failed to check like' });
    }
});

// Get post likes
router.get('/post/:postId', async (req, res) => {
    console.log('[DEBUG] GET /likes/post/:postId -', req.params.postId);
    try {
        const likes = await Like.find({ postId: req.params.postId });
        console.log('[DEBUG] GET /likes/post - Found:', likes.length);
        res.json({ likes: likes.map(l => l.userAddress), total: likes.length });
    } catch (error) {
        console.error('[DEBUG] GET /likes/post ERROR:', error);
        res.status(500).json({ error: 'Failed to get likes' });
    }
});

module.exports = router;
