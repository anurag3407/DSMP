const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    onChainId: {
        type: Number,
        unique: true,
        sparse: true // Allows null for off-chain only posts
    },
    author: {
        type: String,
        required: true,
        lowercase: true
    },
    content: {
        type: String,
        required: true,
        maxlength: 1000
    },
    contentCID: {
        type: String, // IPFS CID if stored on-chain
        default: ''
    },
    isOnChain: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    likesCount: {
        type: Number,
        default: 0
    },
    commentsCount: {
        type: Number,
        default: 0
    },
    txHash: {
        type: String,
        default: ''
    }
}, { timestamps: true });

// Indexes for faster queries
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ isDeleted: 1 });

module.exports = mongoose.model('Post', postSchema);
