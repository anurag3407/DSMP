wimport TryCatch from "../utils/TryCatch.js";
import { User } from "../models/userModel.js";
import pinataService from "../services/pinataService.js";
import blockchainService from "../services/blockchainService.js";
import { generateToken } from "../utils/generateTokens.js";
import { ethers } from 'ethers';
import crypto from 'crypto';

/**
 * Check if user exists by wallet address
 */
export const checkUser = TryCatch(async (req, res) => {
    const { walletAddress } = req.body;

    if (!walletAddress) {
        return res.status(400).json({ message: "Wallet address is required" });
    }

    // Validate Ethereum address
    if (!ethers.isAddress(walletAddress)) {
        return res.status(400).json({ message: "Invalid Ethereum wallet address" });
    }

    const normalizedWallet = walletAddress.toLowerCase();

    // Check if user exists in database
    const user = await User.findOne({ walletAddress: normalizedWallet });

    res.status(200).json({
        exists: !!user,
        user: user ? {
            id: user._id,
            name: user.name,
            walletAddress: user.walletAddress,
            profilePicture: user.profilePicture?.url
        } : null
    });
});

/**
 * Generate nonce for login signature
 */
export const getNonce = TryCatch(async (req, res) => {
    const { walletAddress } = req.body;

    if (!walletAddress) {
        return res.status(400).json({ message: "Wallet address is required" });
    }

    // Validate Ethereum address
    if (!ethers.isAddress(walletAddress)) {
        return res.status(400).json({ message: "Invalid Ethereum wallet address" });
    }

    // Generate a random nonce
    const nonce = crypto.randomBytes(16).toString('hex');

    res.status(200).json({
        nonce,
        message: `Sign this message to login to Nounce: ${nonce}`
    });
});

/**
 * Register user with MetaMask wallet (Web3 authentication)
 */
export const registerUser = TryCatch(async (req, res) => {
    const { name, walletAddress, gender } = req.body;
    const file = req.file;

    console.log("Register request received");
    console.log("Body:", req.body);
    console.log("File:", file);

    // Validate required fields
    if (!name || !walletAddress || !gender) {
        return res.status(400).json({ message: "Name, wallet address, and gender are required" });
    }

    if (!file) {
        return res.status(400).json({ message: "Profile picture is required" });
    }

    // Validate Ethereum address
    if (!ethers.isAddress(walletAddress)) {
        return res.status(400).json({ message: "Invalid Ethereum wallet address" });
    }

    // Normalize wallet address
    const normalizedWallet = walletAddress.toLowerCase();

    // Check if user already exists with this wallet
    let user = await User.findOne({ walletAddress: normalizedWallet });
    if (user) {
        return res.status(400).json({ message: "User with this wallet address already exists" });
    }

    // Check if blockchain is enabled
    const enableBlockchain = process.env.ENABLE_BLOCKCHAIN === 'true';

    if (enableBlockchain) {
        // Check if user exists on blockchain
        const isRegisteredOnChain = await blockchainService.isUserRegistered(walletAddress);
        if (isRegisteredOnChain) {
            return res.status(400).json({ message: "Wallet address already registered on blockchain" });
        }
    }

    try {
        // Upload profile picture to Pinata IPFS
        const buffer = file.buffer;
        
        const pinataResult = await pinataService.uploadFile(
            buffer,
            `profile_${normalizedWallet}_${Date.now()}.jpg`,
            { type: 'profile', wallet: normalizedWallet }
        );

        let blockchainResult = null;

        // Register user on blockchain (optional)
        if (enableBlockchain) {
            console.log("Registering user on blockchain...");
            blockchainResult = await blockchainService.registerUser(
                walletAddress,
                name,
                pinataResult.ipfsHash,
                gender
            );
        } else {
            console.log("Blockchain disabled, skipping blockchain registration");
        }

        // Create user in MongoDB
        user = new User({
            name,
            walletAddress: normalizedWallet,
            gender,
            profilePicture: {
                ipfsHash: pinataResult.ipfsHash,
                url: pinataResult.url,
            },
            blockchainData: enableBlockchain && blockchainResult ? {
                transactionHash: blockchainResult.transactionHash,
                blockNumber: blockchainResult.blockNumber,
                onChain: true,
            } : {
                onChain: false,
            },
        });

        await user.save();

        // Generate JWT token
        generateToken(user._id, res);

        const message = enableBlockchain 
            ? "User registered successfully on blockchain and database"
            : "User registered successfully (blockchain disabled)";

        res.status(201).json({
            message,
            user: {
                id: user._id,
                name: user.name,
                walletAddress: user.walletAddress,
                profilePicture: pinataResult.url,
                transactionHash: blockchainResult.transactionHash,
            }
        });
    } catch (error) {
        console.error("Registration error:", error);
        
        // Cleanup: Delete from Pinata if blockchain fails
        if (error.message.includes('Blockchain')) {
            // Attempt cleanup
            console.log("Blockchain registration failed, cleaning up...");
        }

        res.status(500).json({
            message: "Registration failed",
            error: error.message
        });
    }
});

/**
 * Login user with MetaMask wallet signature
 */
export const loginUser = TryCatch(async (req, res) => {
    const { walletAddress, signature, message } = req.body;

    if (!walletAddress || !signature || !message) {
        return res.status(400).json({ message: "Wallet address, signature, and message are required" });
    }

    // Validate Ethereum address
    if (!ethers.isAddress(walletAddress)) {
        return res.status(400).json({ message: "Invalid Ethereum wallet address" });
    }

    const normalizedWallet = walletAddress.toLowerCase();

    // Find user by wallet address
    const user = await User.findOne({ walletAddress: normalizedWallet });
    if (!user) {
        return res.status(404).json({ message: "User not found. Please register first." });
    }

    try {
        // Verify signature
        const recoveredAddress = ethers.verifyMessage(message, signature);
        
        if (recoveredAddress.toLowerCase() !== normalizedWallet) {
            return res.status(401).json({ message: "Invalid signature" });
        }

        // Generate JWT token
        generateToken(user._id, res);

        res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                walletAddress: user.walletAddress,
                profilePicture: user.profilePicture.url,
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(401).json({ message: "Authentication failed", error: error.message });
    }
});

/**
 * Logout user
 */
export const logoutUser = TryCatch(async (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0),
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
    });

    res.status(200).json({ message: "User logged out successfully" });
});

/**
 * Get current user profile
 */
export const getCurrentUser = TryCatch(async (req, res) => {
    const user = await User.findById(req.user._id)
        .select('-password')
        .populate('followers', 'name walletAddress profilePicture')
        .populate('following', 'name walletAddress profilePicture');

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
});
