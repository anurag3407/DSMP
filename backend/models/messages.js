import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
    {
        chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        senderWallet: { type: String, lowercase: true, required: true },
        content: { type: String, required: true },
        readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    },
    { timestamps: true }
);

// Indexes for faster queries
messageSchema.index({ chat: 1, createdAt: -1 });
messageSchema.index({ senderWallet: 1 });

const Message = mongoose.model('Message', messageSchema);

export default Message; 