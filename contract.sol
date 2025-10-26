// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SocialMediaCore {
    // ========================= STRUCTS =========================
    struct User {
        string username;
        string profilePic; // Could be IPFS/Arweave/URL
        bytes32 passwordHash; // Hash for reference
        bool exists;
    }

    struct Post {
        uint256 id;
        address author;
        string content; // Store IPFS hash or short content
        uint256 likes;
        uint256 timestamp;
        uint256 commentCount;
    }

    struct Comment {
        uint256 id;
        address commenter;
        string text;
        uint256 timestamp;
    }

    // ========================= STATE VARIABLES =========================
    uint256 private postCounter;
    uint256 private commentCounter;

    mapping(address => User) public users;
    mapping(uint256 => Post) public posts;
    mapping(uint256 => mapping(uint256 => Comment)) public postComments;
    mapping(uint256 => mapping(address => bool)) private likedByUser; // Track likes

    // ========================= EVENTS =========================
    event UserRegistered(address indexed user, string username);
    event UserUpdated(address indexed user, string newProfilePic);
    event PostCreated(uint256 indexed postId, address indexed author, string content);
    event PostLiked(uint256 indexed postId, address indexed liker);
    event CommentAdded(uint256 indexed postId, uint256 commentId, address indexed commenter, string text);
    event UserRemoved(address indexed user);

    // ========================= USER CRUD =========================

    function registerUser(
        string memory _username,
        string memory _profilePic,
        string memory _password
    ) external {
        require(!users[msg.sender].exists, "Already registered");
        users[msg.sender] = User(_username, _profilePic, keccak256(abi.encodePacked(_password)), true);
        emit UserRegistered(msg.sender, _username);
    }

    function updateUserProfile(string memory _newProfilePic) external {
        require(users[msg.sender].exists, "User not found");
        users[msg.sender].profilePic = _newProfilePic;
        emit UserUpdated(msg.sender, _newProfilePic);
    }

    function removeUser() external {
        require(users[msg.sender].exists, "User not found");
        delete users[msg.sender]; // Removes mapping completely
        emit UserRemoved(msg.sender);
    }

    // ========================= POST MANAGEMENT =========================

    function createPost(string memory _content) external {
        require(users[msg.sender].exists, "Register first");
        postCounter++;

        posts[postCounter] = Post({
            id: postCounter,
            author: msg.sender,
            content: _content,
            likes: 0,
            timestamp: block.timestamp,
            commentCount: 0
        });

        emit PostCreated(postCounter, msg.sender, _content);
    }

    function likePost(uint256 _postId) external {
        require(users[msg.sender].exists, "Register first");
        require(posts[_postId].id != 0, "Invalid post");
        require(!likedByUser[_postId][msg.sender], "Already liked");

        posts[_postId].likes += 1;
        likedByUser[_postId][msg.sender] = true;
        emit PostLiked(_postId, msg.sender);
    }

    function addComment(uint256 _postId, string memory _text) external {
        require(users[msg.sender].exists, "Register first");
        require(posts[_postId].id != 0, "Invalid post");

        commentCounter++;
        posts[_postId].commentCount++;

        postComments[_postId][posts[_postId].commentCount] = Comment({
            id: commentCounter,
            commenter: msg.sender,
            text: _text,
            timestamp: block.timestamp
        });

        emit CommentAdded(_postId, commentCounter, msg.sender, _text);
    }

    // ========================= VIEW FUNCTIONS =========================

    function getPost(uint256 _postId)
        external
        view
        returns (address author, string memory content, uint256 likes, uint256 comments, uint256 timestamp)
    {
        Post memory p = posts[_postId];
        return (p.author, p.content, p.likes, p.commentCount, p.timestamp);
    }

    function getComment(uint256 _postId, uint256 _commentIndex)
        external
        view
        returns (address commenter, string memory text, uint256 timestamp)
    {
        Comment memory c = postComments[_postId][_commentIndex];
        return (c.commenter, c.text, c.timestamp);
    }

    function userExists(address _addr) external view returns (bool) {
        return users
