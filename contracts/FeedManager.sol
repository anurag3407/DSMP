// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./FollowManager.sol";
import "./PostManager.sol";
import "./UserProfile.sol";

contract FeedManager {
    struct FeedPost {
        uint postId;
        address author;
        string contentCID;
        uint timestamp;
        string authorUsername;
    }

    FollowManager public followManager;
    PostManager public postManager;
    UserProfile public userProfile;

    uint public constant POSTS_PER_PAGE = 10;

    constructor(
        address _followManager,
        address _postManager,
        address _userProfile
    ) {
        followManager = FollowManager(_followManager);
        postManager = PostManager(_postManager);
        userProfile = UserProfile(_userProfile);
    }

    modifier onlyRegisteredUser() {
        require(userProfile.isUserRegistered(msg.sender), "Caller not registered");
        _;
    }

    function getFeed(uint _page) external view onlyRegisteredUser returns (FeedPost[] memory) {
        address[] memory following = followManager.getFollowing(msg.sender);
        FeedPost[] memory allPosts = _collectPostsFromFollowedUsers(following);
        _sortPostsByTimestamp(allPosts);
        return _paginatePosts(allPosts, _page);
    }


    function getFeedPostCount() external view onlyRegisteredUser returns (uint) {
        address[] memory following = followManager.getFollowing(msg.sender);
        uint totalPosts = 0;
        
        for (uint i = 0; i < following.length; i++) {
            uint[] memory userPostIds = postManager.getUserPosts(following[i]);
            totalPosts += userPostIds.length;
        }
        
        return totalPosts;
    }

    function _collectPostsFromFollowedUsers(address[] memory following) internal view returns (FeedPost[] memory) {
        uint totalPosts = 0;
        for (uint i = 0; i < following.length; i++) {
            uint[] memory userPostIds = postManager.getUserPosts(following[i]);
            totalPosts += userPostIds.length;
        }
        
        FeedPost[] memory allPosts = new FeedPost[](totalPosts);
        uint postIndex = 0;
        
                for (uint i = 0; i < following.length; i++) {
            uint[] memory userPostIds = postManager.getUserPosts(following[i]);
            address user = following[i];
            UserProfile.User memory userInfo = userProfile.getProfile(user);
            
            for (uint j = 0; j < userPostIds.length; j++) {
                PostManager.Post memory post = postManager.getPost(userPostIds[j]);
                
                allPosts[postIndex] = FeedPost({
                    postId: post.id,
                    author: post.author,
                    contentCID: post.contentCID,
                    timestamp: post.timestamp,
                    authorUsername: userInfo.username
                });
                
                postIndex++;
            }
        }
        
        return allPosts;
    }

    function _sortPostsByTimestamp(FeedPost[] memory posts) internal pure {
        uint n = posts.length;
        if (n <= 1) return; 
        
        for (uint i = 0; i < n - 1; i++) {
            for (uint j = 0; j < n - i - 1; j++) {
                if (posts[j].timestamp < posts[j + 1].timestamp) {
                    FeedPost memory temp = posts[j];
                    posts[j] = posts[j + 1];
                    posts[j + 1] = temp;
                }
            }
        }
    }

    function _paginatePosts(FeedPost[] memory posts, uint page) internal pure returns (FeedPost[] memory) {
        uint totalPosts = posts.length;
        uint startIndex = page * POSTS_PER_PAGE;

        if (startIndex >= totalPosts) {
            return new FeedPost[](0);
        }
                uint postsToReturn = POSTS_PER_PAGE;
        if (startIndex + POSTS_PER_PAGE > totalPosts) {
            postsToReturn = totalPosts - startIndex;
        }

        FeedPost[] memory pagePosts = new FeedPost[](postsToReturn);
        
        for (uint i = 0; i < postsToReturn; i++) {
            pagePosts[i] = posts[startIndex + i];
        }
        
        return pagePosts;
    }
}
