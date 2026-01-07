const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Get comments for post
router.get('/post/:postId', async (req, res) => {
    console.log('[DEBUG] GET /comments/post/:postId -', req.params.postId);
    try {
        const comments = await Comment.find({ postId: req.params.postId, isDeleted: false }).sort({ createdAt: -1 });
        const enriched = await Promise.all(comments.map(async (c) => {
            const author = await User.findOne({ walletAddress: c.author });
            return { ...c.toObject(), authorUsername: author?.username || c.author.slice(0, 8) + '...' };
        }));
        console.log('[DEBUG] GET /comments/post - Found:', enriched.length);
        res.json({ comments: enriched });
    } catch (error) {
        console.error('[DEBUG] GET /comments/post ERROR:', error);
        res.status(500).json({ error: 'Failed to get comments' });
    }
});

// Add comment
router.post('/post/:postId', auth, async (req, res) => {
    console.log('[DEBUG] POST /comments/post/:postId -', req.params.postId, 'user:', req.user?.walletAddress);
    try {
        const { content } = req.body;
        if (!content?.trim()) {
            console.log('[DEBUG] POST /comments - Empty content');
            return res.status(400).json({ error: 'Content required' });
        }

        const post = await Post.findById(req.params.postId);
        if (!post || post.isDeleted) {
            console.log('[DEBUG] POST /comments - Post not found');
            return res.status(404).json({ error: 'Post not found' });
        }

        const comment = new Comment({
            postId: req.params.postId,
            author: req.user.walletAddress,
            content: content.trim()
        });
        await comment.save();
        await Post.findByIdAndUpdate(req.params.postId, { $inc: { commentsCount: 1 } });

        const author = await User.findOne({ walletAddress: req.user.walletAddress });
        console.log('[DEBUG] POST /comments - Created successfully');
        res.status(201).json({
            ...comment.toObject(),
            authorUsername: author?.username || req.user.walletAddress.slice(0, 8) + '...'
        });
    } catch (error) {
        console.error('[DEBUG] POST /comments ERROR:', error);
        res.status(500).json({ error: 'Failed to add comment' });
    }
});

// Delete comment
router.delete('/:id', auth, async (req, res) => {
    console.log('[DEBUG] DELETE /comments/:id -', req.params.id, 'user:', req.user?.walletAddress);
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment || comment.isDeleted) {
            console.log('[DEBUG] DELETE /comments - Not found');
            return res.status(404).json({ error: 'Comment not found' });
        }

        if (comment.author !== req.user.walletAddress) {
            console.log('[DEBUG] DELETE /comments - Not authorized');
            return res.status(403).json({ error: 'Not authorized' });
        }

        comment.isDeleted = true;
        await comment.save();
        await Post.findByIdAndUpdate(comment.postId, { $inc: { commentsCount: -1 } });
        console.log('[DEBUG] DELETE /comments - Deleted successfully');
        res.json({ message: 'Comment deleted' });
    } catch (error) {
        console.error('[DEBUG] DELETE /comments ERROR:', error);
        res.status(500).json({ error: 'Failed to delete comment' });
    }
});

module.exports = router;
