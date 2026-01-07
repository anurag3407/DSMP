// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./UserProfile.sol";

contract PostManager {
    struct Post {
        uint id;
        address author;
        string contentCID; // IPFS CID or content hash
        uint timestamp;
        bool isDeleted;
    }

    uint public nextPostId;
    mapping(uint => Post) private posts;
    mapping(address => uint[]) private userPosts;

    UserProfile public userProfile;

    event PostCreated(uint indexed postId, address indexed author, string contentCID);
    event PostEdited(uint indexed postId, address indexed author, string newContentCID);
    event PostDeleted(uint indexed postId, address indexed author);

    constructor(address userProfileAddress) {
        userProfile = UserProfile(userProfileAddress);
    }

    modifier onlyRegisteredUser() {
        require(userProfile.isUserRegistered(msg.sender), "User not registered");
        _;
    }

    modifier onlyPostAuthor(uint _postId) {
        require(posts[_postId].author == msg.sender, "Not post author");
        _;
    }

    modifier validPost(uint _postId) {
        require(_postId < nextPostId, "Invalid post ID");
        require(!posts[_postId].isDeleted, "Post is deleted");
        _;
    }

    function createPost(string memory _contentCID) external onlyRegisteredUser returns (uint) {
        require(bytes(_contentCID).length > 0, "Content cannot be empty");
        
        uint postId = nextPostId++;
        posts[postId] = Post({
            id: postId,
            author: msg.sender,
            contentCID: _contentCID,
            timestamp: block.timestamp,
            isDeleted: false
        });

        userPosts[msg.sender].push(postId);

        emit PostCreated(postId, msg.sender, _contentCID);
        return postId;
    }

    function editPost(uint _postId, string memory _newContentCID) 
        external 
        onlyRegisteredUser 
        validPost(_postId) 
        onlyPostAuthor(_postId) 
    {
        require(bytes(_newContentCID).length > 0, "Content cannot be empty");
        
        posts[_postId].contentCID = _newContentCID;
        
        emit PostEdited(_postId, msg.sender, _newContentCID);
    }

    function deletePost(uint _postId) 
        external 
        onlyRegisteredUser 
        validPost(_postId) 
        onlyPostAuthor(_postId) 
    {
        posts[_postId].isDeleted = true;
        
        emit PostDeleted(_postId, msg.sender);
    }

    function getPost(uint _postId) external view returns (Post memory) {
        return posts[_postId];
    }

    function getUserPosts(address _user) external view returns (uint[] memory) {
        uint[] memory allPosts = userPosts[_user];
        
        // Count non-deleted posts
        uint activeCount = 0;
        for (uint i = 0; i < allPosts.length; i++) {
            if (!posts[allPosts[i]].isDeleted) {
                activeCount++;
            }
        }

        // Create array of active post IDs
        uint[] memory activePosts = new uint[](activeCount);
        uint index = 0;
        for (uint i = 0; i < allPosts.length; i++) {
            if (!posts[allPosts[i]].isDeleted) {
                activePosts[index] = allPosts[i];
                index++;
            }
        }

        return activePosts;
    }

    function getTotalPosts() external view returns (uint) {
        return nextPostId;
    }

    function isPostDeleted(uint _postId) external view returns (bool) {
        return posts[_postId].isDeleted;
    }
}
