import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, SEPOLIA_RPC_URL } from '../contracts/addresses.js';
import {
  USER_PROFILE_ABI,
  POST_MANAGER_ABI,
  FOLLOW_MANAGER_ABI,
  LIKE_MANAGER_ABI,
  FEED_MANAGER_ABI,
  COMMENT_MANAGER_ABI
} from '../contracts/abis.js';
import { getNonce, login } from './api.js';

let provider;
let signer;
let userProfileContract;
let postManagerContract;
let followManagerContract;
let likeManagerContract;
let feedManagerContract;
let commentManagerContract;

export const connectWallet = async () => {
  console.log('[DEBUG] connectWallet: Starting wallet connection...');

  if (typeof window.ethereum !== 'undefined') {
    try {
      // Request account access
      console.log('[DEBUG] connectWallet: Requesting account access...');
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      provider = new ethers.providers.Web3Provider(window.ethereum);
      console.log('[DEBUG] connectWallet: Provider initialized');

      // Check network and switch to Sepolia if necessary
      const network = await provider.getNetwork();
      console.log('[DEBUG] connectWallet: Current network:', network.chainId, network.name);

      if (network.chainId !== 11155111) { // Sepolia testnet chainId
        console.log('[DEBUG] connectWallet: Switching to Sepolia network...');
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xaa36a7' }], // Sepolia chainId in hex
          });
          // Reinitialize provider after switch
          provider = new ethers.providers.Web3Provider(window.ethereum);
          console.log('[DEBUG] connectWallet: Switched to Sepolia');
        } catch (switchError) {
          console.log('[DEBUG] connectWallet: Switch error:', switchError.code);
          // If network not added, add it
          if (switchError.code === 4902) {
            console.log('[DEBUG] connectWallet: Adding Sepolia network...');
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0xaa36a7',
                chainName: 'Sepolia',
                nativeCurrency: {
                  name: 'SepoliaETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: [SEPOLIA_RPC_URL],
                blockExplorerUrls: ['https://sepolia.etherscan.io/'],
              }],
            });
            // Reinitialize provider after adding
            provider = new ethers.providers.Web3Provider(window.ethereum);
            console.log('[DEBUG] connectWallet: Added and switched to Sepolia');
          } else {
            throw switchError;
          }
        }
      }

      signer = provider.getSigner();
      const address = await signer.getAddress();
      console.log('[DEBUG] connectWallet: Wallet address:', address);

      // Initialize contracts with debug
      console.log('[DEBUG] connectWallet: Contract addresses:', CONTRACT_ADDRESSES);

      if (!CONTRACT_ADDRESSES.UserProfile) {
        throw new Error('UserProfile contract address is not configured');
      }
      userProfileContract = new ethers.Contract(CONTRACT_ADDRESSES.UserProfile, USER_PROFILE_ABI, signer);
      console.log('[DEBUG] connectWallet: UserProfile contract initialized');

      if (!CONTRACT_ADDRESSES.PostManager) {
        throw new Error('PostManager contract address is not configured');
      }
      postManagerContract = new ethers.Contract(CONTRACT_ADDRESSES.PostManager, POST_MANAGER_ABI, signer);
      console.log('[DEBUG] connectWallet: PostManager contract initialized');

      if (CONTRACT_ADDRESSES.FollowManager) {
        followManagerContract = new ethers.Contract(CONTRACT_ADDRESSES.FollowManager, FOLLOW_MANAGER_ABI, signer);
        console.log('[DEBUG] connectWallet: FollowManager contract initialized');
      }

      if (CONTRACT_ADDRESSES.LikeManager) {
        likeManagerContract = new ethers.Contract(CONTRACT_ADDRESSES.LikeManager, LIKE_MANAGER_ABI, signer);
        console.log('[DEBUG] connectWallet: LikeManager contract initialized');
      }

      if (CONTRACT_ADDRESSES.FeedManager) {
        feedManagerContract = new ethers.Contract(CONTRACT_ADDRESSES.FeedManager, FEED_MANAGER_ABI, signer);
        console.log('[DEBUG] connectWallet: FeedManager contract initialized');
      }

      if (CONTRACT_ADDRESSES.CommentManager) {
        commentManagerContract = new ethers.Contract(CONTRACT_ADDRESSES.CommentManager, COMMENT_MANAGER_ABI, signer);
        console.log('[DEBUG] connectWallet: CommentManager contract initialized');
      }

      console.log('[DEBUG] connectWallet: All contracts initialized successfully');
      return address;
    } catch (error) {
      console.error('[DEBUG] connectWallet ERROR:', error.message, error);
      throw error;
    }
  } else {
    console.error('[DEBUG] connectWallet: MetaMask not installed');
    throw new Error('MetaMask is not installed');
  }
};

// Sign message for backend authentication
export const signMessage = async (message) => {
  if (!signer) {
    throw new Error('Wallet not connected');
  }
  return await signer.signMessage(message);
};

// Login to backend with wallet signature
export const loginToBackend = async (walletAddress) => {
  try {
    // Get nonce from backend
    const { message } = await getNonce(walletAddress);

    // Sign the message
    const signature = await signMessage(message);

    // Login with signature
    const result = await login(walletAddress, signature);
    return result;
  } catch (error) {
    console.error('Backend login error:', error);
    throw error;
  }
};

export const getProvider = () => provider;
export const getSigner = () => signer;
export const getUserProfileContract = () => userProfileContract;
export const getPostManagerContract = () => postManagerContract;
export const getFollowManagerContract = () => followManagerContract;
export const getLikeManagerContract = () => likeManagerContract;
export const getFeedManagerContract = () => feedManagerContract;
export const getCommentManagerContract = () => commentManagerContract;

// User Profile functions
export const createProfile = async (username, bio, avatarCID) => {
  try {
    if (!userProfileContract) {
      throw new Error('Please connect your wallet first');
    }
    const tx = await userProfileContract.createProfile(username, bio, avatarCID);
    await tx.wait();
    return tx;
  } catch (error) {
    console.error('Error creating profile:', error);
    throw error;
  }
};

export const updateProfile = async (username, bio, avatarCID) => {
  try {
    const tx = await userProfileContract.updateProfile(username, bio, avatarCID);
    await tx.wait();
    return tx;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

export const getProfile = async (userAddress) => {
  try {
    const profile = await userProfileContract.getProfile(userAddress);
    return {
      username: profile.username,
      bio: profile.bio,
      avatarCID: profile.avatarCID,
      wallet: profile.wallet
    };
  } catch (error) {
    console.error('Error getting profile:', error);
    throw error;
  }
};

export const isUserRegistered = async (userAddress) => {
  try {
    if (!userProfileContract) {
      console.warn('UserProfile contract not initialized');
      return false;
    }
    return await userProfileContract.isUserRegistered(userAddress);
  } catch (error) {
    console.error('Error checking user registration:', error);
    return false;
  }
};

// Post functions
export const createPost = async (content) => {
  try {
    const tx = await postManagerContract.createPost(content);
    const receipt = await tx.wait();

    // Get post ID from event
    const event = receipt.events?.find(e => e.event === 'PostCreated');
    const postId = event?.args?.postId?.toString();

    return { tx, postId, txHash: tx.hash };
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

export const editPost = async (postId, newContent) => {
  try {
    const tx = await postManagerContract.editPost(postId, newContent);
    await tx.wait();
    return tx;
  } catch (error) {
    console.error('Error editing post:', error);
    throw error;
  }
};

export const deletePost = async (postId) => {
  try {
    const tx = await postManagerContract.deletePost(postId);
    await tx.wait();
    return tx;
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

export const getPost = async (postId) => {
  try {
    const post = await postManagerContract.getPost(postId);
    return {
      id: post.id.toString(),
      author: post.author,
      contentCID: post.contentCID,
      timestamp: post.timestamp.toString(),
      isDeleted: post.isDeleted
    };
  } catch (error) {
    console.error('Error getting post:', error);
    throw error;
  }
};

export const getUserPosts = async (userAddress) => {
  try {
    const postIds = await postManagerContract.getUserPosts(userAddress);
    return postIds.map(id => id.toString());
  } catch (error) {
    console.error('Error getting user posts:', error);
    throw error;
  }
};

export const getTotalPosts = async () => {
  try {
    const total = await postManagerContract.nextPostId();
    return total.toString();
  } catch (error) {
    console.error('Error getting total posts:', error);
    throw error;
  }
};

// Follow functions
export const followUser = async (userAddress) => {
  try {
    const tx = await followManagerContract.follow(userAddress);
    await tx.wait();
    return tx;
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
};

export const unfollowUser = async (userAddress) => {
  try {
    const tx = await followManagerContract.unfollow(userAddress);
    await tx.wait();
    return tx;
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
};

export const getFollowers = async (userAddress) => {
  try {
    return await followManagerContract.getFollowers(userAddress);
  } catch (error) {
    console.error('Error getting followers:', error);
    throw error;
  }
};

export const getFollowing = async (userAddress) => {
  try {
    return await followManagerContract.getFollowing(userAddress);
  } catch (error) {
    console.error('Error getting following:', error);
    throw error;
  }
};

export const isFollowing = async (follower, followed) => {
  try {
    return await followManagerContract.isUserFollowing(follower, followed);
  } catch (error) {
    console.error('Error checking follow status:', error);
    throw error;
  }
};

// Like functions
export const likePost = async (postId) => {
  try {
    const tx = await likeManagerContract.likePost(postId);
    await tx.wait();
    return tx;
  } catch (error) {
    console.error('Error liking post:', error);
    throw error;
  }
};

export const unlikePost = async (postId) => {
  try {
    const tx = await likeManagerContract.unlikePost(postId);
    await tx.wait();
    return tx;
  } catch (error) {
    console.error('Error unliking post:', error);
    throw error;
  }
};

export const getLikes = async (postId) => {
  try {
    const likes = await likeManagerContract.getLikes(postId);
    return likes;
  } catch (error) {
    console.error('Error getting likes:', error);
    throw error;
  }
};

export const hasLiked = async (userAddress, postId) => {
  try {
    return await likeManagerContract.hasLiked(userAddress, postId);
  } catch (error) {
    console.error('Error checking like status:', error);
    throw error;
  }
};

// Comment functions (on-chain)
export const addCommentOnChain = async (postId, content) => {
  try {
    if (!commentManagerContract) {
      throw new Error('CommentManager contract not initialized');
    }
    const tx = await commentManagerContract.addComment(postId, content);
    const receipt = await tx.wait();

    const event = receipt.events?.find(e => e.event === 'CommentCreated');
    const commentId = event?.args?.commentId?.toString();

    return { tx, commentId };
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

export const deleteCommentOnChain = async (commentId) => {
  try {
    if (!commentManagerContract) {
      throw new Error('CommentManager contract not initialized');
    }
    const tx = await commentManagerContract.deleteComment(commentId);
    await tx.wait();
    return tx;
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};

export const getCommentsOnChain = async (postId) => {
  try {
    if (!commentManagerContract) {
      return [];
    }
    const comments = await commentManagerContract.getPostComments(postId);
    return comments.map(c => ({
      id: c.id.toString(),
      postId: c.postId.toString(),
      author: c.author,
      content: c.content,
      timestamp: c.timestamp.toString(),
      isDeleted: c.isDeleted
    }));
  } catch (error) {
    console.error('Error getting comments:', error);
    throw error;
  }
};

// Feed functions
export const getFeed = async (page = 0) => {
  try {
    const feed = await feedManagerContract.getFeed(page);
    return feed.map(post => ({
      postId: post.postId.toString(),
      author: post.author,
      contentCID: post.contentCID,
      timestamp: post.timestamp.toString(),
      authorUsername: post.authorUsername
    }));
  } catch (error) {
    console.error('Error getting feed:', error);
    throw error;
  }
};

export const getFeedPostCount = async () => {
  try {
    const count = await feedManagerContract.getFeedPostCount();
    return count.toString();
  } catch (error) {
    console.error('Error getting feed post count:', error);
    throw error;
  }
};
