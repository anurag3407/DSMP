import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        sparse: true,
        trim: true,
    },
    password: {
        type: String,
    },
    walletAddress: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    gender: {
        type: String,
        enum: ["male", "female", "other"],
        required: true,
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    isAdmin: {
        type: Boolean,
        default: false,
    },
    profilePicture: {
        ipfsHash: String,
        url: String,
    },
    coverPicture: {
        ipfsHash: String,
        url: String,
    },
    blockchainData: {
        transactionHash: String,
        blockNumber: Number,
        onChain: {
            type: Boolean,
            default: false,
        },
    },
}, { timestamps: true });      


export const User = mongoose.model("User", userSchema);