import TryCatch from "../utils/TryCatch.js";
import { User } from "../models/userModel.js";
import { Post } from "../models/postModel.js";
import pinataService from "../services/pinataService.js";
import blockchainService from "../services/blockchainService.js";

/**
 * Get my profile
 */
export const myProfile = TryCatch(async (req, res) => {
    const user = await User.findById(req.user._id)
        .select('-password')
        .populate('followers', 'name walletAddress profilePicture')
        .populate('following', 'name walletAddress profilePicture');

    // Get user's posts
    const posts = await Post.find({ owner: req.user._id })
        .sort({ createdAt: -1 })
        .populate('owner', 'name walletAddress profilePicture')
        .populate('likes', 'name walletAddress profilePicture')
        .populate('comments.user', 'name walletAddress profilePicture');

    res.status(200).json({
        user: {
            ...user.toObject(),
            posts: posts,
        }
    });
});

/**
 * Get user profile by ID
 */
export const userProfile = TryCatch(async (req, res) => {
    const user = await User.findById(req.params.id)
        .select('-password')
        .populate('followers', 'name walletAddress profilePicture')
        .populate('following', 'name walletAddress profilePicture');

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    // Get user's posts
    const posts = await Post.find({ owner: req.params.id })
        .sort({ createdAt: -1 })
        .populate('owner', 'name walletAddress profilePicture')
        .populate('likes', 'name walletAddress profilePicture')
        .populate('comments.user', 'name walletAddress profilePicture');

    res.status(200).json({
        user: {
            ...user.toObject(),
            posts: posts,
        }
    });
});

/**
 * Get user profile by wallet address
 * UNUSED - Not routed or called by frontend
 */
// export const getUserByWallet = TryCatch(async (req, res) => {
//     const { walletAddress } = req.params;

//     const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() })
//         .select('-password')
//         .populate('followers', 'name walletAddress profilePicture')
//         .populate('following', 'name walletAddress profilePicture');

//     if (!user) {
//         return res.status(404).json({ message: "User not found" });
//     }

//     // Get user's posts
//     const posts = await Post.find({ owner: user._id })
//         .sort({ createdAt: -1 })
//         .populate('owner', 'name walletAddress profilePicture')
//         .populate('likes', 'name walletAddress profilePicture')
//         .populate('comments.user', 'name walletAddress profilePicture');

//     res.status(200).json({
//         user: {
//             ...user.toObject(),
//             posts: posts,
//         }
//     });
// });

/**
 * Follow/Unfollow a user (update both database and blockchain)
 */
export const followandUnfollowUser = TryCatch(async (req, res) => {
    const userToFollow = await User.findById(req.params.id);
    const loggedInUser = await User.findById(req.user._id);

    if (!userToFollow) {
        return res.status(404).json({ message: "User not found" });
    }

    if (userToFollow.id.toString() === loggedInUser.id.toString()) {
        return res.status(400).json({ message: "You cannot follow yourself" });
    }

    try {
        const isFollowing = userToFollow.followers.includes(loggedInUser._id);

        // Update blockchain
        console.log("Updating follow status on blockchain...");
        await blockchainService.toggleFollow(userToFollow.walletAddress);

        // Update MongoDB
        if (isFollowing) {
            // Unfollow
            const indexFollowing = loggedInUser.following.indexOf(userToFollow._id);
            const indexFollowers = userToFollow.followers.indexOf(loggedInUser._id);

            loggedInUser.following.splice(indexFollowing, 1);
            userToFollow.followers.splice(indexFollowers, 1);

            await loggedInUser.save();
            await userToFollow.save();

            return res.status(200).json({ message: "User unfollowed", following: false });
        } else {
            // Follow
            userToFollow.followers.push(loggedInUser._id);
            loggedInUser.following.push(userToFollow._id);

            await userToFollow.save();
            await loggedInUser.save();

            return res.status(200).json({ message: "User followed", following: true });
        }
    } catch (error) {
        console.error("Error toggling follow:", error);
        res.status(500).json({
            message: "Follow operation failed",
            error: error.message
        });
    }
});

/**
 * Get user's followers and following
 */
export const userFollowerandFollowing = TryCatch(async (req, res) => {
    const user = await User.findById(req.params.id)
        .populate('followers', 'name walletAddress profilePicture')
        .populate('following', 'name walletAddress profilePicture');

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const followers = user.followers.map((follower) => ({
        _id: follower._id,
        name: follower.name,
        walletAddress: follower.walletAddress,
        profilePicture: follower.profilePicture,
    }));

    const following = user.following.map((followedUser) => ({
        _id: followedUser._id,
        name: followedUser.name,
        walletAddress: followedUser.walletAddress,
        profilePicture: followedUser.profilePicture,
    }));

    res.status(200).json({
        followers,
        following,
    });
});

/**
 * Update user profile (update both database and blockchain)
 */
export const updateProfile = TryCatch(async (req, res) => {
    const user = await User.findById(req.user._id);
    const { name } = req.body;
    const file = req.file;

    let ipfsHash = user.profilePicture.ipfsHash;
    let ipfsUrl = user.profilePicture.url;

    try {
        // Update profile picture if provided
        if (file) {
            // Upload new image to Pinata
            const buffer = file.buffer;

            const pinataResult = await pinataService.uploadFile(
                buffer,
                `profile_${user.walletAddress}_${Date.now()}.jpg`,
                { type: 'profile', wallet: user.walletAddress }
            );

            ipfsHash = pinataResult.ipfsHash;
            ipfsUrl = pinataResult.url;

            // Delete old image from Pinata
            if (user.profilePicture.ipfsHash) {
                await pinataService.deleteFile(user.profilePicture.ipfsHash);
            }

            // Update in MongoDB
            user.profilePicture = {
                ipfsHash: ipfsHash,
                url: ipfsUrl,
            };
        }

        // Update name if provided
        if (name) {
            user.name = name;
        }

        // Update blockchain
        if (name || file) {
            console.log("Updating user on blockchain...");
            const blockchainResult = await blockchainService.updateUser(
                user.walletAddress,
                user.name,
                ipfsHash
            );

            user.blockchainData.transactionHash = blockchainResult.transactionHash;
            user.blockchainData.blockNumber = blockchainResult.blockNumber;
        }

        await user.save();

        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: user._id,
                name: user.name,
                walletAddress: user.walletAddress,
                profilePicture: user.profilePicture,
            }
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({
            message: "Profile update failed",
            error: error.message
        });
    }
});

/**
 * Delete user account (remove from database, blockchain, and IPFS)
 * UNUSED - No frontend implementation for account deletion
 */
// export const deleteUser = TryCatch(async (req, res) => {
//     const user = await User.findById(req.user._id);

//     if (!user) {
//         return res.status(404).json({ message: "User not found" });
//     }

//     try {
//         // Delete from blockchain
//         console.log("Deleting user from blockchain...");
//         await blockchainService.deleteUser(user.walletAddress);

//         // Delete profile picture from Pinata
//         if (user.profilePicture.ipfsHash) {
//             console.log("Deleting profile picture from Pinata...");
//             await pinataService.deleteFile(user.profilePicture.ipfsHash);
//         }

//         // Delete all user's posts
//         const userPosts = await Post.find({ owner: user._id });
//         for (const post of userPosts) {
//             if (post.image.ipfsHash) {
//                 await pinataService.deleteFile(post.image.ipfsHash);
//             }
//             await post.deleteOne();
//         }

//         // Delete from MongoDB
//         await user.deleteOne();

//         // Clear cookie
//         res.cookie('token', '', {
//             httpOnly: true,
//             expires: new Date(0),
//         });

//         res.status(200).json({ message: "User account deleted successfully from all platforms" });
//     } catch (error) {
//         console.error("Error deleting user:", error);
//         res.status(500).json({
//             message: "User deletion failed",
//             error: error.message
//         });
//     }
// });

/**
 * Get all users (search functionality)
 * UNUSED - Route exists but no frontend calls this endpoint
 */
// export const getAllUsers = TryCatch(async (req, res) => {
//     const search = req.query.search || "";

//     const users = await User.find({
//         _id: { $ne: req.user._id },
//         $or: [
//             { name: { $regex: search, $options: "i" } },
//             { walletAddress: { $regex: search, $options: "i" } },
//         ],
//     })
//         .select('-password')
//         .populate('followers', 'name walletAddress profilePicture')
//         .populate('following', 'name walletAddress profilePicture')
//         .limit(20);

//     res.status(200).json({ users });
// });

/**
 * Get recommended users
 */
export const getRecommendedUsers = TryCatch(async (req, res) => {
    const currentUser = await User.findById(req.user._id);

    // Find users that current user is not following
    const users = await User.find({
        _id: {
            $ne: req.user._id,
            $nin: currentUser.following
        },
    })
        .select('name walletAddress profilePicture followers')
        .limit(10)
        .sort({ createdAt: -1 });

    res.status(200).json({ users });
});
