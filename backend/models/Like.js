const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    userAddress: {
        type: String,
        required: true,
        lowercase: true
    }
}, { timestamps: true });

likeSchema.index({ postId: 1, userAddress: 1 }, { unique: true });
likeSchema.index({ userAddress: 1 });

module.exports = mongoose.model('Like', likeSchema);
