import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    caption: {
        type: String,
        required: true
    },
    post: {
        ipfsHash: String,
        url: String
    },
    type: {
        type: String,
        required: true,
        enum: ["image", "video", "reel"],
        default: "image"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        text: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    image: {
        ipfsHash: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    blockchainData: {
        postId: Number,
        transactionHash: String,
        blockNumber: Number,
        onChain: {
            type: Boolean,
            default: false,
        },
    },
}, {
    timestamps: true
});

export const Post = mongoose.model("Post", postSchema);    
