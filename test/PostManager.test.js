const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PostManager", function () {
  let UserProfile, PostManager;
  let userProfile, postManager;
  let owner, addr1;

    beforeEach(async function () {
    UserProfile = await ethers.getContractFactory("UserProfile");
    PostManager = await ethers.getContractFactory("PostManager");
    [owner, addr1] = await ethers.getSigners();

    userProfile = await UserProfile.deploy();

    postManager = await PostManager.deploy(userProfile.address);

    await userProfile.connect(addr1).createProfile("alice", "bio", "avatarCID");
  });

  describe("Post Creation", function () {
    it("Should allow registered user to create a post", async function () {
      await postManager.connect(addr1).createPost("QmContentCID");
      const post = await postManager.getPost(0);
      expect(post.id).to.equal(0);
      expect(post.author).to.equal(addr1.address);
      expect(post.contentCID).to.equal("QmContentCID");

    });

    it("Should not allow unregistered user to create a post", async function () {
      await expect(
        postManager.createPost("QmContentCID")
      ).to.be.revertedWith("User not registered");
    });
  });

  describe("Get User Posts", function () {
    it("Should return posts created by a user", async function () {
      await postManager.connect(addr1).createPost("QmContentCID1");
      await postManager.connect(addr1).createPost("QmContentCID2");
      const userPosts = await postManager.getUserPosts(addr1.address);
      expect(userPosts.length).to.equal(2);
      expect(userPosts[0]).to.equal(0);
      expect(userPosts[1]).to.equal(1);
    });
  });
});
