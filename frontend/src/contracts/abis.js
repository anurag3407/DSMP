export const USER_PROFILE_ABI = [
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "username", "type": "string" }
    ],
    "name": "ProfileCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "username", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "bio", "type": "string" }
    ],
    "name": "ProfileUpdated",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_username", "type": "string" },
      { "internalType": "string", "name": "_bio", "type": "string" },
      { "internalType": "string", "name": "_avatarCID", "type": "string" }
    ],
    "name": "createProfile",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_user", "type": "address" }],
    "name": "getProfile",
    "outputs": [
      {
        "components": [
          { "internalType": "string", "name": "username", "type": "string" },
          { "internalType": "string", "name": "bio", "type": "string" },
          { "internalType": "string", "name": "avatarCID", "type": "string" },
          { "internalType": "address", "name": "wallet", "type": "address" }
        ],
        "internalType": "struct UserProfile.User",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_user", "type": "address" }],
    "name": "isUserRegistered",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_username", "type": "string" },
      { "internalType": "string", "name": "_bio", "type": "string" },
      { "internalType": "string", "name": "_avatarCID", "type": "string" }
    ],
    "name": "updateProfile",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export const POST_MANAGER_ABI = [
  {
    "inputs": [{ "internalType": "address", "name": "userProfileAddress", "type": "address" }],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "postId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "author", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "contentCID", "type": "string" }
    ],
    "name": "PostCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "postId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "author", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "newContentCID", "type": "string" }
    ],
    "name": "PostEdited",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "postId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "author", "type": "address" }
    ],
    "name": "PostDeleted",
    "type": "event"
  },
  {
    "inputs": [{ "internalType": "string", "name": "_contentCID", "type": "string" }],
    "name": "createPost",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_postId", "type": "uint256" },
      { "internalType": "string", "name": "_newContentCID", "type": "string" }
    ],
    "name": "editPost",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_postId", "type": "uint256" }],
    "name": "deletePost",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_postId", "type": "uint256" }],
    "name": "getPost",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "id", "type": "uint256" },
          { "internalType": "address", "name": "author", "type": "address" },
          { "internalType": "string", "name": "contentCID", "type": "string" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
          { "internalType": "bool", "name": "isDeleted", "type": "bool" }
        ],
        "internalType": "struct PostManager.Post",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_user", "type": "address" }],
    "name": "getUserPosts",
    "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "nextPostId",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_postId", "type": "uint256" }],
    "name": "isPostDeleted",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  }
];

export const FOLLOW_MANAGER_ABI = [
  {
    "inputs": [{ "internalType": "address", "name": "userProfileAddress", "type": "address" }],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "follower", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "following", "type": "address" }
    ],
    "name": "Followed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "follower", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "unfollowed", "type": "address" }
    ],
    "name": "Unfollowed",
    "type": "event"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_user", "type": "address" }],
    "name": "follow",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_user", "type": "address" }],
    "name": "getFollowers",
    "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_user", "type": "address" }],
    "name": "getFollowing",
    "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_follower", "type": "address" },
      { "internalType": "address", "name": "_following", "type": "address" }
    ],
    "name": "isUserFollowing",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_user", "type": "address" }],
    "name": "unfollow",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export const LIKE_MANAGER_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "_postManager", "type": "address" },
      { "internalType": "address", "name": "_userProfile", "type": "address" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "liker", "type": "address" },
      { "indexed": true, "internalType": "uint256", "name": "postId", "type": "uint256" }
    ],
    "name": "PostLiked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "unliker", "type": "address" },
      { "indexed": true, "internalType": "uint256", "name": "postId", "type": "uint256" }
    ],
    "name": "PostUnliked",
    "type": "event"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_postId", "type": "uint256" }],
    "name": "likePost",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_postId", "type": "uint256" }],
    "name": "unlikePost",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_postId", "type": "uint256" }],
    "name": "getLikes",
    "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_user", "type": "address" },
      { "internalType": "uint256", "name": "_postId", "type": "uint256" }
    ],
    "name": "hasLiked",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  }
];

export const COMMENT_MANAGER_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "_postManager", "type": "address" },
      { "internalType": "address", "name": "_userProfile", "type": "address" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "commentId", "type": "uint256" },
      { "indexed": true, "internalType": "uint256", "name": "postId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "author", "type": "address" }
    ],
    "name": "CommentCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "commentId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "author", "type": "address" }
    ],
    "name": "CommentDeleted",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_postId", "type": "uint256" },
      { "internalType": "string", "name": "_content", "type": "string" }
    ],
    "name": "addComment",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_commentId", "type": "uint256" }],
    "name": "deleteComment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_commentId", "type": "uint256" }],
    "name": "getComment",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "id", "type": "uint256" },
          { "internalType": "uint256", "name": "postId", "type": "uint256" },
          { "internalType": "address", "name": "author", "type": "address" },
          { "internalType": "string", "name": "content", "type": "string" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
          { "internalType": "bool", "name": "isDeleted", "type": "bool" }
        ],
        "internalType": "struct CommentManager.Comment",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_postId", "type": "uint256" }],
    "name": "getPostComments",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "id", "type": "uint256" },
          { "internalType": "uint256", "name": "postId", "type": "uint256" },
          { "internalType": "address", "name": "author", "type": "address" },
          { "internalType": "string", "name": "content", "type": "string" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
          { "internalType": "bool", "name": "isDeleted", "type": "bool" }
        ],
        "internalType": "struct CommentManager.Comment[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_postId", "type": "uint256" }],
    "name": "getCommentCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "nextCommentId",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];

export const FEED_MANAGER_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "_followManager", "type": "address" },
      { "internalType": "address", "name": "_postManager", "type": "address" },
      { "internalType": "address", "name": "_userProfile", "type": "address" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_page", "type": "uint256" }],
    "name": "getFeed",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "postId", "type": "uint256" },
          { "internalType": "address", "name": "author", "type": "address" },
          { "internalType": "string", "name": "contentCID", "type": "string" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
          { "internalType": "string", "name": "authorUsername", "type": "string" }
        ],
        "internalType": "struct FeedManager.FeedPost[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getFeedPostCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "POSTS_PER_PAGE",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];
