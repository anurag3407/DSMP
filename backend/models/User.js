const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    walletAddress: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    username: {
        type: String,
        default: ''
    },
    bio: {
        type: String,
        default: ''
    },
    avatarCID: {
        type: String,
        default: ''
    },
    nonce: {
        type: String,
        required: true
    },
    isOnChain: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Note: walletAddress already has unique: true which creates an index
// No need for additional index definition

module.exports = mongoose.model('User', userSchema);
