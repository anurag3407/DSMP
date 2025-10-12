const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CommentManager", function () {
  let userProfile;
  let postManager;
  let commentManager;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    // Deploy UserProfile contract
    const UserProfile = await ethers.getContractFactory("UserProfile");
    userProfile = await UserProfile.deploy();

    // Deploy PostManager contract
    const PostManager = await ethers.getContractFactory("PostManager");
    postManager = await PostManager.deploy(userProfile.address);

    // Deploy CommentManager contract
    const CommentManager = await ethers.getContractFactory("CommentManager");
    commentManager = await CommentManager.deploy(postManager.address, userProfile.address);

    // Get signers
    [owner, addr1, addr2] = await ethers.getSigners();

    // Register users
    await userProfile.createProfile("owner", "bio", "avatarCID");
    await userProfile.connect(addr1).createProfile("addr1", "bio", "avatarCID");
    await userProfile.connect(addr2).createProfile("addr2", "bio", "avatarCID");

    // Create a post
    await postManager.createPost("contentCID123");
  });

  describe("Comment Creation", function () {
    it("Should allow a registered user to add a comment", async function () {
      await expect(commentManager.connect(addr1).addComment(0, "This is a comment"))
        .to.emit(commentManager, "CommentCreated")
        .withArgs(0, 0, addr1.address);

      const comment = await commentManager.getComment(0);
      expect(comment.id).to.equal(0);
      expect(comment.postId).to.equal(0);
      expect(comment.author).to.equal(addr1.address);
      expect(comment.content).to.equal("This is a comment");
    });

    it("Should not allow unregistered user to add comment", async function () {
      // Create a new user that hasn't registered
      const [newUser] = await ethers.getSigners();
      // Skip the first 3 signers (owner, addr1, addr2) and get the fourth one
      const unregisteredUser = (await ethers.getSigners())[3];
      
      await expect(commentManager.connect(unregisteredUser).addComment(0, "This should fail"))
        .to.be.revertedWith("Caller not registered");
    });

    it("Should not allow empty comment content", async function () {
      await expect(commentManager.connect(addr1).addComment(0, ""))
        .to.be.revertedWith("Content cannot be empty");
    });

    it("Should not allow comment content longer than 280 characters", async function () {
      const longContent = "a".repeat(281);
      await expect(commentManager.connect(addr1).addComment(0, longContent))
        .to.be.revertedWith("Content too long");
    });
  });

  describe("Comment Retrieval", function () {
    beforeEach(async function () {
      // Add some comments
      await commentManager.connect(addr1).addComment(0, "First comment");
      await commentManager.connect(addr2).addComment(0, "Second comment");
    });

    it("Should retrieve a specific comment", async function () {
      const comment = await commentManager.getComment(0);
      expect(comment.content).to.equal("First comment");
      expect(comment.author).to.equal(addr1.address);
    });

    it("Should retrieve all comments for a post", async function () {
      const comments = await commentManager.getPostComments(0);
      expect(comments.length).to.equal(2);
      expect(comments[0].content).to.equal("First comment");
      expect(comments[1].content).to.equal("Second comment");
    });
  });

  describe("Comment Deletion", function () {
    beforeEach(async function () {
      // Add a comment
      await commentManager.connect(addr1).addComment(0, "This is a comment");
    });

    it("Should allow comment author to delete their comment", async function () {
      await expect(commentManager.connect(addr1).deleteComment(0))
        .to.emit(commentManager, "CommentDeleted")
        .withArgs(0, addr1.address);
    });

    it("Should not allow non-author to delete comment", async function () {
      await expect(commentManager.connect(addr2).deleteComment(0))
        .to.be.revertedWith("Not comment author");
    });
  });
});
