// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./PostManager.sol";
import "./UserProfile.sol";

contract LikeManager {
    mapping(uint => address[]) private likesPerPost;
    mapping(address => mapping(uint => bool)) private liked;

    PostManager public postManager;
    UserProfile public userProfile;

    event PostLiked(address indexed liker, uint indexed postId);
    event PostUnliked(address indexed unliker, uint indexed postId);

    constructor(address _postManager, address _userProfile) {
        postManager = PostManager(_postManager);
        userProfile = UserProfile(_userProfile);
    }

    modifier onlyRegisteredUser() {
        require(userProfile.isUserRegistered(msg.sender), "Caller not registered");
        _;
    }

    modifier validPost(uint _postId) {
        require(postManager.getPost(_postId).author != address(0), "Invalid post");
        _;
    }

    function likePost(uint _postId) external onlyRegisteredUser validPost(_postId) {
        require(!liked[msg.sender][_postId], "Already liked");

        liked[msg.sender][_postId] = true;
        likesPerPost[_postId].push(msg.sender);

        emit PostLiked(msg.sender, _postId);
    }

    function unlikePost(uint _postId) external onlyRegisteredUser validPost(_postId) {
        require(liked[msg.sender][_postId], "Not liked");

        liked[msg.sender][_postId] = false;
        _remove(likesPerPost[_postId], msg.sender);

        emit PostUnliked(msg.sender, _postId);
    }

    function getLikes(uint _postId) external view returns (address[] memory) {
        return likesPerPost[_postId];
    }

    function hasLiked(address _user, uint _postId) external view returns (bool) {
        return liked[_user][_postId];
    }

    function _remove(address[] storage array, address target) internal {
        uint length = array.length;
        for (uint i = 0; i < length; i++) {
            if (array[i] == target) {
                array[i] = array[length - 1];
                array.pop();
                break;
            }
        }
    }
}
