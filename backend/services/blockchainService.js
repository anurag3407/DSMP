import { ethers } from 'ethers';
import dotenv from 'dotenv';
import contractABI from '../../artifacts/contracts/DecentralizedSocialMedia.sol/DecentralizedSocialMedia.json' with { type: 'json' };

dotenv.config();

class BlockchainService {
    constructor() {
        this.provider = null;
        this.contract = null;
        this.signer = null;
        this.initialized = false;
        this.enabled = process.env.ENABLE_BLOCKCHAIN === 'true';
    }

    async initialize() {
        try {
            if (this.initialized) return;
            
            if (!this.enabled) {
                console.log('Blockchain service disabled (ENABLE_BLOCKCHAIN=false)');
                return;
            }

            // Connect to Sepolia network
            this.provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);

            // Create wallet from private key
            this.signer = new ethers.Wallet(process.env.SEPOLIA_PRIVATE_KEY, this.provider);

            // Connect to contract
            this.contract = new ethers.Contract(
                process.env.CONTRACT_ADDRESS,
                contractABI.abi,
                this.signer
            );

            this.initialized = true;
            console.log('Blockchain service initialized successfully');
            console.log('Contract address:', process.env.CONTRACT_ADDRESS);
        } catch (error) {
            console.error('Error initializing blockchain service:', error);
            if (this.enabled) {
                throw new Error('Failed to initialize blockchain service');
            }
        }
    }

    async ensureInitialized() {
        if (!this.enabled) {
            throw new Error('Blockchain service is disabled');
        }
        if (!this.initialized) {
            await this.initialize();
        }
    }

    // User Functions

    async registerUser(walletAddress, name, profilePictureIPFS, gender) {
        try {
            await this.ensureInitialized();

            // Check if user already exists
            const isRegistered = await this.contract.isUserRegistered(walletAddress);
            if (isRegistered) {
                throw new Error('User already registered on blockchain');
            }

            // Create user wallet instance to sign transaction
            const userWallet = new ethers.Wallet(process.env.SEPOLIA_PRIVATE_KEY, this.provider);
            const contractWithSigner = this.contract.connect(userWallet);

            const tx = await contractWithSigner.registerUser(name, profilePictureIPFS, gender, {
                gasLimit: 500000
            });

            const receipt = await tx.wait();

            return {
                success: true,
                transactionHash: receipt.hash,
                blockNumber: receipt.blockNumber,
            };
        } catch (error) {
            console.error('Error registering user on blockchain:', error);
            throw new Error(`Blockchain registration failed: ${error.message}`);
        }
    }

    async updateUser(walletAddress, name, profilePictureIPFS) {
        try {
            await this.ensureInitialized();

            const userWallet = new ethers.Wallet(process.env.SEPOLIA_PRIVATE_KEY, this.provider);
            const contractWithSigner = this.contract.connect(userWallet);

            const tx = await contractWithSigner.updateUser(name, profilePictureIPFS, {
                gasLimit: 300000
            });

            const receipt = await tx.wait();

            return {
                success: true,
                transactionHash: receipt.hash,
                blockNumber: receipt.blockNumber,
            };
        } catch (error) {
            console.error('Error updating user on blockchain:', error);
            throw new Error(`Blockchain update failed: ${error.message}`);
        }
    }

    async deleteUser(walletAddress) {
        try {
            await this.ensureInitialized();

            const userWallet = new ethers.Wallet(process.env.SEPOLIA_PRIVATE_KEY, this.provider);
            const contractWithSigner = this.contract.connect(userWallet);

            const tx = await contractWithSigner.deleteUser({
                gasLimit: 300000
            });

            const receipt = await tx.wait();

            return {
                success: true,
                transactionHash: receipt.hash,
                blockNumber: receipt.blockNumber,
            };
        } catch (error) {
            console.error('Error deleting user on blockchain:', error);
            throw new Error(`Blockchain deletion failed: ${error.message}`);
        }
    }

    async getUser(walletAddress) {
        try {
            await this.ensureInitialized();

            const user = await this.contract.getUser(walletAddress);

            return {
                walletAddress: user.walletAddress,
                name: user.name,
                profilePictureIPFS: user.profilePictureIPFS,
                gender: user.gender,
                followerCount: Number(user.followerCount),
                followingCount: Number(user.followingCount),
                postCount: Number(user.postCount),
                exists: user.exists,
                createdAt: Number(user.createdAt),
            };
        } catch (error) {
            console.error('Error fetching user from blockchain:', error);
            return null;
        }
    }

    async isUserRegistered(walletAddress) {
        try {
            await this.ensureInitialized();
            return await this.contract.isUserRegistered(walletAddress);
        } catch (error) {
            console.error('Error checking user registration:', error);
            return false;
        }
    }

    // Post Functions

    async createPost(walletAddress, caption, contentIPFS, contentType) {
        try {
            await this.ensureInitialized();

            const userWallet = new ethers.Wallet(process.env.SEPOLIA_PRIVATE_KEY, this.provider);
            const contractWithSigner = this.contract.connect(userWallet);

            const tx = await contractWithSigner.createPost(caption, contentIPFS, contentType, {
                gasLimit: 500000
            });

            const receipt = await tx.wait();

            // Get post ID from event
            const event = receipt.logs.find(log => {
                try {
                    const parsed = contractWithSigner.interface.parseLog(log);
                    return parsed.name === 'PostCreated';
                } catch {
                    return false;
                }
            });

            let postId = null;
            if (event) {
                const parsed = contractWithSigner.interface.parseLog(event);
                postId = Number(parsed.args.postId);
            }

            return {
                success: true,
                transactionHash: receipt.hash,
                blockNumber: receipt.blockNumber,
                postId: postId,
            };
        } catch (error) {
            console.error('Error creating post on blockchain:', error);
            throw new Error(`Blockchain post creation failed: ${error.message}`);
        }
    }

    async deletePost(postId) {
        try {
            await this.ensureInitialized();

            const userWallet = new ethers.Wallet(process.env.SEPOLIA_PRIVATE_KEY, this.provider);
            const contractWithSigner = this.contract.connect(userWallet);

            const tx = await contractWithSigner.deletePost(postId, {
                gasLimit: 300000
            });

            const receipt = await tx.wait();

            return {
                success: true,
                transactionHash: receipt.hash,
                blockNumber: receipt.blockNumber,
            };
        } catch (error) {
            console.error('Error deleting post on blockchain:', error);
            throw new Error(`Blockchain post deletion failed: ${error.message}`);
        }
    }

    async getPost(postId) {
        try {
            await this.ensureInitialized();

            const post = await this.contract.getPost(postId);

            return {
                postId: Number(post.postId),
                owner: post.owner,
                caption: post.caption,
                contentIPFS: post.contentIPFS,
                contentType: post.contentType,
                likeCount: Number(post.likeCount),
                commentCount: Number(post.commentCount),
                createdAt: Number(post.createdAt),
                exists: post.exists,
            };
        } catch (error) {
            console.error('Error fetching post from blockchain:', error);
            return null;
        }
    }

    async getUserPosts(walletAddress) {
        try {
            await this.ensureInitialized();

            const postIds = await this.contract.getUserPosts(walletAddress);
            return postIds.map(id => Number(id));
        } catch (error) {
            console.error('Error fetching user posts from blockchain:', error);
            return [];
        }
    }

    // Like Functions

    async toggleLike(postId) {
        try {
            await this.ensureInitialized();

            const userWallet = new ethers.Wallet(process.env.SEPOLIA_PRIVATE_KEY, this.provider);
            const contractWithSigner = this.contract.connect(userWallet);

            const tx = await contractWithSigner.toggleLike(postId, {
                gasLimit: 200000
            });

            const receipt = await tx.wait();

            return {
                success: true,
                transactionHash: receipt.hash,
                blockNumber: receipt.blockNumber,
            };
        } catch (error) {
            console.error('Error toggling like on blockchain:', error);
            throw new Error(`Blockchain like failed: ${error.message}`);
        }
    }

    async hasLiked(postId, walletAddress) {
        try {
            await this.ensureInitialized();
            return await this.contract.hasLiked(postId, walletAddress);
        } catch (error) {
            console.error('Error checking like status:', error);
            return false;
        }
    }

    // Comment Functions

    async addComment(postId, text) {
        try {
            await this.ensureInitialized();

            const userWallet = new ethers.Wallet(process.env.SEPOLIA_PRIVATE_KEY, this.provider);
            const contractWithSigner = this.contract.connect(userWallet);

            const tx = await contractWithSigner.addComment(postId, text, {
                gasLimit: 300000
            });

            const receipt = await tx.wait();

            return {
                success: true,
                transactionHash: receipt.hash,
                blockNumber: receipt.blockNumber,
            };
        } catch (error) {
            console.error('Error adding comment on blockchain:', error);
            throw new Error(`Blockchain comment failed: ${error.message}`);
        }
    }

    async deleteComment(postId, commentIndex) {
        try {
            await this.ensureInitialized();

            const userWallet = new ethers.Wallet(process.env.SEPOLIA_PRIVATE_KEY, this.provider);
            const contractWithSigner = this.contract.connect(userWallet);

            const tx = await contractWithSigner.deleteComment(postId, commentIndex, {
                gasLimit: 200000
            });

            const receipt = await tx.wait();

            return {
                success: true,
                transactionHash: receipt.hash,
                blockNumber: receipt.blockNumber,
            };
        } catch (error) {
            console.error('Error deleting comment on blockchain:', error);
            throw new Error(`Blockchain comment deletion failed: ${error.message}`);
        }
    }

    async getPostComments(postId) {
        try {
            await this.ensureInitialized();

            const comments = await this.contract.getPostComments(postId);

            return comments.map(comment => ({
                commentId: Number(comment.commentId),
                postId: Number(comment.postId),
                commenter: comment.commenter,
                text: comment.text,
                createdAt: Number(comment.createdAt),
            }));
        } catch (error) {
            console.error('Error fetching comments from blockchain:', error);
            return [];
        }
    }

    // Follow Functions

    async toggleFollow(userToFollow) {
        try {
            await this.ensureInitialized();

            const userWallet = new ethers.Wallet(process.env.SEPOLIA_PRIVATE_KEY, this.provider);
            const contractWithSigner = this.contract.connect(userWallet);

            const tx = await contractWithSigner.toggleFollow(userToFollow, {
                gasLimit: 300000
            });

            const receipt = await tx.wait();

            return {
                success: true,
                transactionHash: receipt.hash,
                blockNumber: receipt.blockNumber,
            };
        } catch (error) {
            console.error('Error toggling follow on blockchain:', error);
            throw new Error(`Blockchain follow failed: ${error.message}`);
        }
    }

    async checkFollowing(follower, following) {
        try {
            await this.ensureInitialized();
            return await this.contract.checkFollowing(follower, following);
        } catch (error) {
            console.error('Error checking follow status:', error);
            return false;
        }
    }

    async getFollowers(walletAddress) {
        try {
            await this.ensureInitialized();
            return await this.contract.getFollowers(walletAddress);
        } catch (error) {
            console.error('Error fetching followers from blockchain:', error);
            return [];
        }
    }

    async getFollowing(walletAddress) {
        try {
            await this.ensureInitialized();
            return await this.contract.getFollowing(walletAddress);
        } catch (error) {
            console.error('Error fetching following from blockchain:', error);
            return [];
        }
    }

    // Stats

    async getContractStats() {
        try {
            await this.ensureInitialized();

            const stats = await this.contract.getContractStats();

            return {
                userCount: Number(stats[0]),
                postCount: Number(stats[1]),
                commentCount: Number(stats[2]),
            };
        } catch (error) {
            console.error('Error fetching contract stats:', error);
            return { userCount: 0, postCount: 0, commentCount: 0 };
        }
    }
}

// Export singleton instance
const blockchainService = new BlockchainService();

export default blockchainService;
