import TryCatch from "../utils/TryCatch.js";
import { Post } from "../models/postModel.js";
import { User } from "../models/userModel.js";
import pinataService from "../services/pinataService.js";
import blockchainService from "../services/blockchainService.js";

/**
 * Create a new post (upload to IPFS and register on blockchain)
 */
export const newPost = TryCatch(async (req, res) => {
    const { caption } = req.body;
    const ownerId = req.user._id;
    const ownerWallet = req.user.walletAddress;
    const file = req.file;
    const type = req.query.type || "image";

    if (!caption) {
        return res.status(400).json({ message: "Caption is required" });
    }

    if (!file) {
        return res.status(400).json({ message: "Media file is required" });
    }

    try {
        // Use file buffer directly from multer
        const buffer = file.buffer;

        // Upload to Pinata IPFS
        console.log("Uploading media to Pinata IPFS...");
        const pinataResult = await pinataService.uploadFile(
            buffer,
            `post_${ownerWallet}_${Date.now()}.${type === 'video' ? 'mp4' : 'jpg'}`,
            { type: 'post', owner: ownerWallet, contentType: type }
        );

        let blockchainResult = null;

        // Register post on blockchain (optional)
        const enableBlockchain = process.env.ENABLE_BLOCKCHAIN === 'true';
        if (enableBlockchain) {
            console.log("Registering post on blockchain...");
            blockchainResult = await blockchainService.createPost(
                ownerWallet,
                caption,
                pinataResult.ipfsHash,
                type
            );
        } else {
            console.log("Blockchain disabled, skipping blockchain post registration");
        }

        // Create post in MongoDB
        const post = await Post.create({
            caption,
            type,
            post: {
                ipfsHash: pinataResult.ipfsHash,
                url: pinataResult.url,
            },
            image: {
                ipfsHash: pinataResult.ipfsHash,
                url: pinataResult.url,
            },
            owner: ownerId,
            blockchainData: enableBlockchain && blockchainResult ? {
                postId: blockchainResult.postId,
                transactionHash: blockchainResult.transactionHash,
                blockNumber: blockchainResult.blockNumber,
                onChain: true,
            } : {
                onChain: false,
            },
        });

        // Populate owner data
        await post.populate('owner', 'name walletAddress profilePicture');

        const message = enableBlockchain 
            ? "Post created successfully on blockchain and database"
            : "Post created successfully (blockchain disabled)";

        res.status(201).json({
            message,
            post: {
                ...post.toObject(),
                blockchainPostId: blockchainResult?.postId,
                transactionHash: blockchainResult?.transactionHash,
            }
        });
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({
            message: "Post creation failed",
            error: error.message
        });
    }
});

/**
 * Delete a post (remove from database and blockchain)
 */
export const deletePost = TryCatch(async (req, res) => {
    const post = await Post.findById(req.params.id);

    if (!post) {
        return res.status(404).json({ message: "Post not found" });
    }

    // Check ownership
    if (post.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Unauthorized: You can only delete your own posts" });
    }

    try {
        // Delete from blockchain if it exists
        if (post.blockchainData && post.blockchainData.postId) {
            console.log("Deleting post from blockchain...");
            await blockchainService.deletePost(post.blockchainData.postId);
        }

        // Delete from Pinata IPFS
        if (post.image && post.image.ipfsHash) {
            console.log("Removing from Pinata IPFS...");
            await pinataService.deleteFile(post.image.ipfsHash);
        }

        // Delete from MongoDB
        await post.deleteOne();

        res.json({ message: "Post deleted successfully from all platforms" });
    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({
            message: "Post deletion failed",
            error: error.message
        });
    }
});

/**
 * Get all posts (feed)
 */
export const getAllPosts = TryCatch(async (req, res) => {
    const posts = await Post.find()
        .sort({ createdAt: -1 })
        .populate('owner', 'name walletAddress profilePicture')
        .populate('comments.user', 'name walletAddress profilePicture')
        .populate('likes', 'name walletAddress profilePicture');

    res.status(200).json({ posts });
});

/*
 * UNUSED FUNCTION - COMMENTED OUT FOR GAS OPTIMIZATION
 * Get posts by type (reels, images, etc.)
 * Not currently used by frontend
 */
// export const getPostsByType = TryCatch(async (req, res) => {
//     const { type } = req.params;

//     const posts = await Post.find({ type })
//         .sort({ createdAt: -1 })
//         .populate('owner', 'name walletAddress profilePicture')
//         .populate('comments.user', 'name walletAddress profilePicture')
//         .populate('likes', 'name walletAddress profilePicture');

//     res.status(200).json({ posts });
// });

/**
 * Like or unlike a post (MongoDB only - no blockchain)
 */
export const likeAndUnlikePost = TryCatch(async (req, res) => {
    const post = await Post.findById(req.params.id);

    if (!post) {
        return res.status(404).json({ message: "Post not found" });
    }

    const isLiked = post.likes.includes(req.user._id);

    // Update MongoDB only (likes not stored on blockchain for gas optimization)
    if (isLiked) {
        const index = post.likes.indexOf(req.user._id);
        post.likes.splice(index, 1);
        await post.save();
        return res.json({ message: "Post unliked", liked: false });
    } else {
        post.likes.push(req.user._id);
        await post.save();
        return res.json({ message: "Post liked", liked: true });
    }
});

/**
 * Comment on a post (MongoDB only - no blockchain)
 */
export const commentOnPost = TryCatch(async (req, res) => {
    const post = await Post.findById(req.params.id);

    if (!post) {
        return res.status(404).json({ message: "Post not found" });
    }

    const { comment } = req.body;

    if (!comment || comment.trim() === '') {
        return res.status(400).json({ message: "Comment text is required" });
    }

    // Add comment to MongoDB only (comments not stored on blockchain for gas optimization)
    post.comments.push({
        user: req.user._id,
        text: comment,
        createdAt: new Date(),
    });

    await post.save();
    await post.populate('comments.user', 'name walletAddress profilePicture');

    res.json({
        message: "Comment added successfully",
        comments: post.comments,
    });
});

/*
 * UNUSED FUNCTION - COMMENTED OUT FOR GAS OPTIMIZATION
 * Delete a comment
 * Not currently used by frontend - comment deletion not implemented in UI
 */
// export const deleteComment = TryCatch(async (req, res) => {
//     const post = await Post.findById(req.params.id);

//     if (!post) {
//         return res.status(404).json({ message: "Post not found" });
//     }

//     const { commentId } = req.body;

//     if (!commentId) {
//         return res.status(400).json({ message: "Comment ID is required" });
//     }

//     try {
//         // Find comment
//         const comment = post.comments.find((c) => c._id.toString() === commentId.toString());

//         if (!comment) {
//             return res.status(404).json({ message: "Comment not found" });
//         }

//         // Check if user is comment owner or post owner
//         const isCommentOwner = comment.user.toString() === req.user._id.toString();
//         const isPostOwner = post.owner.toString() === req.user._id.toString();

//         if (!isCommentOwner && !isPostOwner) {
//             return res.status(403).json({
//                 message: "Unauthorized: Only comment owner or post owner can delete"
//             });
//         }

//         // Delete from MongoDB
//         const index = post.comments.indexOf(comment);
//         post.comments.splice(index, 1);
//         await post.save();

//         // Note: Blockchain comment deletion is more complex due to array indexing
//         // For now, we only delete from MongoDB

//         res.json({ message: "Comment deleted successfully" });
//     } catch (error) {
//         console.error("Error deleting comment:", error);
//         res.status(500).json({
//             message: "Comment deletion failed",
//             error: error.message
//         });
//     }
// });

/*
 * UNUSED FUNCTION - COMMENTED OUT FOR GAS OPTIMIZATION
 * Get a single post by ID
 * Not currently used by frontend - individual post view not implemented
 */
// export const getPostById = TryCatch(async (req, res) => {
//     const post = await Post.findById(req.params.id)
//         .populate('owner', 'name walletAddress profilePicture')
//         .populate('comments.user', 'name walletAddress profilePicture')
//         .populate('likes', 'name walletAddress profilePicture');

//     if (!post) {
//         return res.status(404).json({ message: "Post not found" });
//     }

//     res.status(200).json({ post });
// });
