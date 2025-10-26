// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DecentralizedSocialMedia
 * @dev Smart contract for a decentralized social media platform
 * Stores user profiles, posts, likes, follows, and comments on Sepolia blockchain
 */
contract DecentralizedSocialMedia {
    
    // Structs
    struct User {
        address walletAddress;
        string name;
        string profilePictureIPFS;
        string gender;
        uint256 followerCount;
        uint256 followingCount;
        uint256 postCount;
        bool exists;
        uint256 createdAt;
    }
    
    struct Post {
        uint256 postId;
        address owner;
        string caption;
        string contentIPFS;
        string contentType;
        uint256 likeCount;
        uint256 commentCount;
        uint256 createdAt;
        bool exists;
    }
    
    struct Comment {
        uint256 commentId;
        uint256 postId;
        address commenter;
        string text;
        uint256 createdAt;
    }
    
    struct Follow {
        address follower;
        address following;
        uint256 followedAt;
    }
    
    // State variables
    address public owner;
    uint256 public userCount;
    uint256 public postCount;
    uint256 public commentCount;
    
    // Mappings
    mapping(address => User) public users;
    mapping(address => bool) public isUserRegistered;
    mapping(uint256 => Post) public posts;
    mapping(uint256 => mapping(address => bool)) public postLikes;
    mapping(uint256 => Comment[]) public postComments;
    mapping(address => mapping(address => bool)) public isFollowing;
    mapping(address => address[]) public userFollowers;
    mapping(address => address[]) public userFollowing;
    mapping(address => uint256[]) public userPosts;
    
    // Events
    event UserRegistered(address indexed walletAddress, string name, uint256 timestamp);
    event UserUpdated(address indexed walletAddress, string name, string profilePictureIPFS);
    event UserDeleted(address indexed walletAddress, uint256 timestamp);
    event PostCreated(uint256 indexed postId, address indexed owner, string contentIPFS, uint256 timestamp);
    event PostDeleted(uint256 indexed postId, address indexed owner, uint256 timestamp);
    event PostLiked(uint256 indexed postId, address indexed liker, uint256 timestamp);
    event PostUnliked(uint256 indexed postId, address indexed unliker, uint256 timestamp);
    event CommentAdded(uint256 indexed postId, uint256 indexed commentId, address indexed commenter, uint256 timestamp);
    event CommentDeleted(uint256 indexed postId, uint256 indexed commentId, uint256 timestamp);
    event UserFollowed(address indexed follower, address indexed following, uint256 timestamp);
    event UserUnfollowed(address indexed follower, address indexed unfollowing, uint256 timestamp);
    event TipSent(address indexed from, address indexed to, uint256 amount, uint256 timestamp);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only contract owner can call this");
        _;
    }
    
    modifier userExists(address _user) {
        require(isUserRegistered[_user], "User does not exist");
        _;
    }
    
    modifier postExists(uint256 _postId) {
        require(posts[_postId].exists, "Post does not exist");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        userCount = 0;
        postCount = 0;
        commentCount = 0;
    }
    
    // User Functions
    
    /**
     * @dev Register a new user
     */
    function registerUser(
        string memory _name,
        string memory _profilePictureIPFS,
        string memory _gender
    ) external {
        require(!isUserRegistered[msg.sender], "User already registered");
        require(bytes(_name).length > 0, "Name cannot be empty");
        
        users[msg.sender] = User({
            walletAddress: msg.sender,
            name: _name,
            profilePictureIPFS: _profilePictureIPFS,
            gender: _gender,
            followerCount: 0,
            followingCount: 0,
            postCount: 0,
            exists: true,
            createdAt: block.timestamp
        });
        
        isUserRegistered[msg.sender] = true;
        userCount++;
        
        emit UserRegistered(msg.sender, _name, block.timestamp);
    }
    
    /**
     * @dev Update user profile
     */
    function updateUser(
        string memory _name,
        string memory _profilePictureIPFS
    ) external userExists(msg.sender) {
        User storage user = users[msg.sender];
        
        if (bytes(_name).length > 0) {
            user.name = _name;
        }
        
        if (bytes(_profilePictureIPFS).length > 0) {
            user.profilePictureIPFS = _profilePictureIPFS;
        }
        
        emit UserUpdated(msg.sender, user.name, user.profilePictureIPFS);
    }
    
    /**
     * @dev Delete user account
     */
    function deleteUser() external userExists(msg.sender) {
        delete users[msg.sender];
        isUserRegistered[msg.sender] = false;
        userCount--;
        
        emit UserDeleted(msg.sender, block.timestamp);
    }
    
    /**
     * @dev Get user profile
     */
    function getUser(address _userAddress) external view returns (User memory) {
        require(isUserRegistered[_userAddress], "User does not exist");
        return users[_userAddress];
    }
    
    // Post Functions
    
    /**
     * @dev Create a new post
     */
    function createPost(
        string memory _caption,
        string memory _contentIPFS,
        string memory _contentType
    ) external userExists(msg.sender) {
        postCount++;
        
        posts[postCount] = Post({
            postId: postCount,
            owner: msg.sender,
            caption: _caption,
            contentIPFS: _contentIPFS,
            contentType: _contentType,
            likeCount: 0,
            commentCount: 0,
            createdAt: block.timestamp,
            exists: true
        });
        
        userPosts[msg.sender].push(postCount);
        users[msg.sender].postCount++;
        
        emit PostCreated(postCount, msg.sender, _contentIPFS, block.timestamp);
    }
    
    /**
     * @dev Delete a post
     */
    function deletePost(uint256 _postId) external postExists(_postId) {
        require(posts[_postId].owner == msg.sender, "Only post owner can delete");
        
        posts[_postId].exists = false;
        users[msg.sender].postCount--;
        
        emit PostDeleted(_postId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Get post details
     */
    function getPost(uint256 _postId) external view postExists(_postId) returns (Post memory) {
        return posts[_postId];
    }
    
    /**
     * @dev Get all posts by a user
     */
    function getUserPosts(address _userAddress) external view returns (uint256[] memory) {
        return userPosts[_userAddress];
    }
    
    // Like Functions
    
    /**
     * @dev Like or unlike a post
     */
    function toggleLike(uint256 _postId) external userExists(msg.sender) postExists(_postId) {
        if (postLikes[_postId][msg.sender]) {
            // Unlike
            postLikes[_postId][msg.sender] = false;
            posts[_postId].likeCount--;
            emit PostUnliked(_postId, msg.sender, block.timestamp);
        } else {
            // Like
            postLikes[_postId][msg.sender] = true;
            posts[_postId].likeCount++;
            emit PostLiked(_postId, msg.sender, block.timestamp);
        }
    }
    
    /**
     * @dev Check if user liked a post
     */
    function hasLiked(uint256 _postId, address _user) external view returns (bool) {
        return postLikes[_postId][_user];
    }
    
    // Comment Functions
    
    /**
     * @dev Add a comment to a post
     */
    function addComment(
        uint256 _postId,
        string memory _text
    ) external userExists(msg.sender) postExists(_postId) {
        require(bytes(_text).length > 0, "Comment cannot be empty");
        
        commentCount++;
        
        Comment memory newComment = Comment({
            commentId: commentCount,
            postId: _postId,
            commenter: msg.sender,
            text: _text,
            createdAt: block.timestamp
        });
        
        postComments[_postId].push(newComment);
        posts[_postId].commentCount++;
        
        emit CommentAdded(_postId, commentCount, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Delete a comment
     */
    function deleteComment(
        uint256 _postId,
        uint256 _commentIndex
    ) external postExists(_postId) {
        require(_commentIndex < postComments[_postId].length, "Invalid comment index");
        
        Comment memory comment = postComments[_postId][_commentIndex];
        require(
            comment.commenter == msg.sender || posts[_postId].owner == msg.sender,
            "Only comment owner or post owner can delete"
        );
        
        // Move last comment to deleted position and pop
        uint256 lastIndex = postComments[_postId].length - 1;
        if (_commentIndex != lastIndex) {
            postComments[_postId][_commentIndex] = postComments[_postId][lastIndex];
        }
        postComments[_postId].pop();
        posts[_postId].commentCount--;
        
        emit CommentDeleted(_postId, comment.commentId, block.timestamp);
    }
    
    /**
     * @dev Get all comments for a post
     */
    function getPostComments(uint256 _postId) external view postExists(_postId) returns (Comment[] memory) {
        return postComments[_postId];
    }
    
    // Follow Functions
    
    /**
     * @dev Follow or unfollow a user
     */
    function toggleFollow(address _userToFollow) external userExists(msg.sender) userExists(_userToFollow) {
        require(msg.sender != _userToFollow, "Cannot follow yourself");
        
        if (isFollowing[msg.sender][_userToFollow]) {
            // Unfollow
            isFollowing[msg.sender][_userToFollow] = false;
            users[msg.sender].followingCount--;
            users[_userToFollow].followerCount--;
            
            // Remove from arrays
            removeFromArray(userFollowing[msg.sender], _userToFollow);
            removeFromArray(userFollowers[_userToFollow], msg.sender);
            
            emit UserUnfollowed(msg.sender, _userToFollow, block.timestamp);
        } else {
            // Follow
            isFollowing[msg.sender][_userToFollow] = true;
            users[msg.sender].followingCount++;
            users[_userToFollow].followerCount++;
            
            userFollowing[msg.sender].push(_userToFollow);
            userFollowers[_userToFollow].push(msg.sender);
            
            emit UserFollowed(msg.sender, _userToFollow, block.timestamp);
        }
    }
    
    /**
     * @dev Check if user is following another user
     */
    function checkFollowing(address _follower, address _following) external view returns (bool) {
        return isFollowing[_follower][_following];
    }
    
    /**
     * @dev Get followers of a user
     */
    function getFollowers(address _user) external view returns (address[] memory) {
        return userFollowers[_user];
    }
    
    /**
     * @dev Get users that a user is following
     */
    function getFollowing(address _user) external view returns (address[] memory) {
        return userFollowing[_user];
    }
    
    // Tip Functions
    
    /**
     * @dev Send ETH tip to another user
     */
    function sendTip(address payable _recipient) external payable userExists(msg.sender) userExists(_recipient) {
        require(msg.value > 0, "Tip amount must be greater than 0");
        require(_recipient != msg.sender, "Cannot tip yourself");
        
        _recipient.transfer(msg.value);
        
        emit TipSent(msg.sender, _recipient, msg.value, block.timestamp);
    }
    
    // Helper Functions
    
    /**
     * @dev Remove address from array
     */
    function removeFromArray(address[] storage array, address element) private {
        for (uint256 i = 0; i < array.length; i++) {
            if (array[i] == element) {
                array[i] = array[array.length - 1];
                array.pop();
                break;
            }
        }
    }
    
    /**
     * @dev Get contract stats
     */
    function getContractStats() external view returns (uint256, uint256, uint256) {
        return (userCount, postCount, commentCount);
    }
}
