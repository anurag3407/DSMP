const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LikeDislikeManager", function () {
  let UserProfile, PostManager, LikeDislikeManager;
  let userProfile, postManager, likeDislikeManager;
  let owner, addr1, addr2;

    beforeEach(async function () {
    UserProfile = await ethers.getContractFactory("UserProfile");
    PostManager = await ethers.getContractFactory("PostManager");
    LikeDislikeManager = await ethers.getContractFactory("LikeManager");
    [owner, addr1, addr2] = await ethers.getSigners();

    userProfile = await UserProfile.deploy();

    postManager = await PostManager.deploy(userProfile.address);

    likeDislikeManager = await LikeDislikeManager.deploy(postManager.address, userProfile.address);

    await userProfile.connect(addr1).createProfile("alice", "bio", "avatarCID");
    await userProfile.connect(addr2).createProfile("bob", "bio2", "avatarCID2");
    await postManager.connect(addr1).createPost("QmContentCID");
  });

  describe("Like Post", function () {
    it("Should allow registered user to like a post", async function () {
      await likeDislikeManager.connect(addr2).likePost(0);
      const likes = await likeDislikeManager.getLikes(0);
      expect(likes.length).to.equal(1);
      expect(likes[0]).to.equal(addr2.address);
      expect(await likeDislikeManager.hasLiked(addr2.address, 0)).to.equal(true);
    });

    it("Should not allow liking a post twice", async function () {
      await likeDislikeManager.connect(addr2).likePost(0);
      await expect(
        likeDislikeManager.connect(addr2).likePost(0)
      ).to.be.revertedWith("Already liked");
    });

    it("Should allow registered user to unlike a post", async function () {
      await likeDislikeManager.connect(addr2).likePost(0);
      await likeDislikeManager.connect(addr2).unlikePost(0);
      const likes = await likeDislikeManager.getLikes(0);
      expect(likes.length).to.equal(0);
      expect(await likeDislikeManager.hasLiked(addr2.address, 0)).to.equal(false);
    });

    it("Should not allow unliking a post not liked", async function () {
      await expect(
        likeDislikeManager.connect(addr2).unlikePost(0)
      ).to.be.revertedWith("Not liked");
    });
  });
});
