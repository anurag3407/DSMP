// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./UserProfile.sol";

contract PostManager {
    struct Post {
        uint id;
        address author;
        string contentCID; // IPFS CID
        uint timestamp;
    }

    uint public nextPostId;
    mapping(uint => Post) private posts;
    mapping(address => uint[]) private userPosts;

    UserProfile public userProfile;

    event PostCreated(uint indexed postId, address indexed author, string contentCID);

    constructor(address userProfileAddress) {
        userProfile = UserProfile(userProfileAddress);
    }

    modifier onlyRegisteredUser() {
        require(userProfile.isUserRegistered(msg.sender), "User not registered");
        _;
    }

    function createPost(string memory _contentCID) external onlyRegisteredUser {
        uint postId = nextPostId++;
        posts[postId] = Post({
            id: postId,
            author: msg.sender,
            contentCID: _contentCID,
            timestamp: block.timestamp
        });

        userPosts[msg.sender].push(postId);

        emit PostCreated(postId, msg.sender, _contentCID);
    }

    function getPost(uint _postId) external view returns (Post memory) {
        return posts[_postId];
    }

    function getUserPosts(address _user) external view returns (uint[] memory) {
        return userPosts[_user];
    }
}
