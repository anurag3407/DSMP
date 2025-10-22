import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, SEPOLIA_RPC_URL } from '../contracts/addresses.js';
import {
  USER_PROFILE_ABI,
  POST_MANAGER_ABI,
  FOLLOW_MANAGER_ABI,
  LIKE_MANAGER_ABI,
  FEED_MANAGER_ABI
} from '../contracts/abis.js';

let provider;
let signer;
let userProfileContract;
let postManagerContract;
let followManagerContract;
let likeManagerContract;
let feedManagerContract;

export const connectWallet = async () => {
  if (typeof window.ethereum !== 'undefined') {
    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      provider = new ethers.providers.Web3Provider(window.ethereum);

      // Check network and switch to Sepolia if necessary
      const network = await provider.getNetwork();
      if (network.chainId !== 11155111) { // Sepolia testnet chainId
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xaa36a7' }], // Sepolia chainId in hex
          });
          // Reinitialize provider after switch
          provider = new ethers.providers.Web3Provider(window.ethereum);
        } catch (switchError) {
          // If network not added, add it
          if (switchError.code === 4902) {
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
          } else {
            throw switchError;
          }
        }
      }

      signer = provider.getSigner();

      // Initialize contracts
      userProfileContract = new ethers.Contract(CONTRACT_ADDRESSES.UserProfile, USER_PROFILE_ABI, signer);
      postManagerContract = new ethers.Contract(CONTRACT_ADDRESSES.PostManager, POST_MANAGER_ABI, signer);
      followManagerContract = new ethers.Contract(CONTRACT_ADDRESSES.FollowManager, FOLLOW_MANAGER_ABI, signer);
      likeManagerContract = new ethers.Contract(CONTRACT_ADDRESSES.LikeManager, LIKE_MANAGER_ABI, signer);
      feedManagerContract = new ethers.Contract(CONTRACT_ADDRESSES.FeedManager, FEED_MANAGER_ABI, signer);

      return await signer.getAddress();
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  } else {
    throw new Error('MetaMask is not installed');
  }
};

export const getProvider = () => provider;
export const getSigner = () => signer;
export const getUserProfileContract = () => userProfileContract;
export const getPostManagerContract = () => postManagerContract;
export const getFollowManagerContract = () => followManagerContract;
export const getLikeManagerContract = () => likeManagerContract;
export const getFeedManagerContract = () => feedManagerContract;

// User Profile functions
export const createProfile = async (username, bio, avatarCID) => {
  try {
    const tx = await userProfileContract.createProfile(username, bio, avatarCID);
    await tx.wait();
    return tx;
  } catch (error) {
    console.error('Error creating profile:', error);
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
    return await userProfileContract.isUserRegistered(userAddress);
  } catch (error) {
    console.error('Error checking user registration:', error);
    throw error;
  }
};

// Post functions
export const createPost = async (content) => {
  try {
    const tx = await postManagerContract.createPost(content);
    await tx.wait();
    return tx;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

export const getPost = async (postId) => {
  try {
    const post = await postManagerContract.getPost(postId);
    return {
      id: post.id.toString(),
      author: post.author,
      content: post.content,
      timestamp: post.timestamp.toString()
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
    const total = await postManagerContract.getTotalPosts();
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
    return await followManagerContract.isFollowing(follower, followed);
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

export const dislikePost = async (postId) => {
  try {
    const tx = await likeManagerContract.dislikePost(postId);
    await tx.wait();
    return tx;
  } catch (error) {
    console.error('Error disliking post:', error);
    throw error;
  }
};

export const getLikes = async (postId) => {
  try {
    const likes = await likeManagerContract.getLikes(postId);
    return likes.toString();
  } catch (error) {
    console.error('Error getting likes:', error);
    throw error;
  }
};

export const getDislikes = async (postId) => {
  try {
    const dislikes = await likeManagerContract.getDislikes(postId);
    return dislikes.toString();
  } catch (error) {
    console.error('Error getting dislikes:', error);
    throw error;
  }
};

export const hasLiked = async (postId, userAddress) => {
  try {
    return await likeManagerContract.hasLiked(postId, userAddress);
  } catch (error) {
    console.error('Error checking like status:', error);
    throw error;
  }
};

export const hasDisliked = async (postId, userAddress) => {
  try {
    return await likeManagerContract.hasDisliked(postId, userAddress);
  } catch (error) {
    console.error('Error checking dislike status:', error);
    throw error;
  }
};

// Feed functions
export const getFeed = async (userAddress) => {
  try {
    const feed = await feedManagerContract.getFeed(userAddress);
    return feed.map(post => ({
      id: post.id.toString(),
      author: post.author,
      content: post.content,
      timestamp: post.timestamp.toString()
    }));
  } catch (error) {
    console.error('Error getting feed:', error);
    throw error;
  }
};
