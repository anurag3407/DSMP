// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./UserProfile.sol";

contract FollowManager {
    mapping(address => mapping(address => bool)) private isFollowing;
    mapping(address => address[]) private followers;
    mapping(address => address[]) private following;

    UserProfile public userProfile;

    event Followed(address indexed follower, address indexed following);
    event Unfollowed(address indexed follower, address indexed unfollowed);

    constructor(address userProfileAddress) {
        userProfile = UserProfile(userProfileAddress);
    }

    modifier onlyRegisteredUser() {
        require(userProfile.isUserRegistered(msg.sender), "Caller not registered");
        _;
    }

    modifier validUser(address _user) {
        require(userProfile.isUserRegistered(_user), "Target user not registered");
        _;
    }

    function follow(address _user) external onlyRegisteredUser validUser(_user) {
        require(msg.sender != _user, "Cannot follow yourself");
        require(!isFollowing[msg.sender][_user], "Already following");

        isFollowing[msg.sender][_user] = true;
        following[msg.sender].push(_user);
        followers[_user].push(msg.sender);

        emit Followed(msg.sender, _user);
    }

    function unfollow(address _user) external onlyRegisteredUser validUser(_user) {
        require(isFollowing[msg.sender][_user], "Not following");

        isFollowing[msg.sender][_user] = false;
        _remove(following[msg.sender], _user);
        _remove(followers[_user], msg.sender);

        emit Unfollowed(msg.sender, _user);
    }

    function getFollowers(address _user) external view returns (address[] memory) {
        return followers[_user];
    }

    function getFollowing(address _user) external view returns (address[] memory) {
        return following[_user];
    }

    function isUserFollowing(address _follower, address _following) external view returns (bool) {
        return isFollowing[_follower][_following];
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
