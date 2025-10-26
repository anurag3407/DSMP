import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema(
    {
        users: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        userWallets: [{
            type: String,
            lowercase: true,
            required: true
        }],
        latestMessages: [{
            sender: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            senderWallet: {
                type: String,
                lowercase: true
            },
            content: String,
            timestamp: {
                type: Date,
                default: Date.now
            }
        }],
    },
    { timestamps: true }
);

// Index for faster wallet-based queries
chatSchema.index({ userWallets: 1 });

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;    