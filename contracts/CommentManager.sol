// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./PostManager.sol";
import "./UserProfile.sol";

contract CommentManager {
    struct Comment {
        uint id;
        uint postId;
        address author;
        string content;
        uint timestamp;
        bool isDeleted;
    }

    uint public nextCommentId;
    mapping(uint => Comment) private comments;
    mapping(uint => uint[]) private postComments; // postId => commentIds

    PostManager public postManager;
    UserProfile public userProfile;

    event CommentCreated(uint indexed commentId, uint indexed postId, address indexed author);
    event CommentDeleted(uint indexed commentId, address indexed author);

    constructor(address _postManager, address _userProfile) {
        postManager = PostManager(_postManager);
        userProfile = UserProfile(_userProfile);
    }

    modifier onlyRegisteredUser() {
        require(userProfile.isUserRegistered(msg.sender), "Caller not registered");
        _;
    }

    modifier validPost(uint _postId) {
        PostManager.Post memory post = postManager.getPost(_postId);
        require(post.author != address(0), "Invalid post");
        _;
    }

    modifier validComment(uint _commentId) {
        require(_commentId < nextCommentId, "Invalid comment");
        require(!comments[_commentId].isDeleted, "Comment already deleted");
        _;
    }

    function addComment(uint _postId, string memory _content) 
        external 
        onlyRegisteredUser 
        validPost(_postId) 
        returns (uint) 
    {
        require(bytes(_content).length > 0, "Content cannot be empty");
        require(bytes(_content).length <= 280, "Content too long");

        uint commentId = nextCommentId++;
        comments[commentId] = Comment({
            id: commentId,
            postId: _postId,
            author: msg.sender,
            content: _content,
            timestamp: block.timestamp,
            isDeleted: false
        });

        postComments[_postId].push(commentId);

        emit CommentCreated(commentId, _postId, msg.sender);
        return commentId;
    }

    function deleteComment(uint _commentId) 
        external 
        onlyRegisteredUser 
        validComment(_commentId) 
    {
        require(comments[_commentId].author == msg.sender, "Not comment author");
        
        comments[_commentId].isDeleted = true;
        
        emit CommentDeleted(_commentId, msg.sender);
    }

    function getComment(uint _commentId) external view returns (Comment memory) {
        require(_commentId < nextCommentId, "Invalid comment");
        return comments[_commentId];
    }

    function getPostComments(uint _postId) external view returns (Comment[] memory) {
        uint[] memory commentIds = postComments[_postId];
        
        // Count non-deleted comments
        uint activeCount = 0;
        for (uint i = 0; i < commentIds.length; i++) {
            if (!comments[commentIds[i]].isDeleted) {
                activeCount++;
            }
        }

        // Create array of active comments
        Comment[] memory activeComments = new Comment[](activeCount);
        uint index = 0;
        for (uint i = 0; i < commentIds.length; i++) {
            if (!comments[commentIds[i]].isDeleted) {
                activeComments[index] = comments[commentIds[i]];
                index++;
            }
        }

        return activeComments;
    }

    function getCommentCount(uint _postId) external view returns (uint) {
        uint[] memory commentIds = postComments[_postId];
        uint count = 0;
        for (uint i = 0; i < commentIds.length; i++) {
            if (!comments[commentIds[i]].isDeleted) {
                count++;
            }
        }
        return count;
    }
}
