const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FeedManager", function () {
  let UserProfile, FollowManager, PostManager, FeedManager;
  let userProfile, followManager, postManager, feedManager;
  let owner, addr1, addr2, addr3;

  beforeEach(async function () {
    UserProfile = await ethers.getContractFactory("UserProfile");
    FollowManager = await ethers.getContractFactory("FollowManager");
    PostManager = await ethers.getContractFactory("PostManager");
    FeedManager = await ethers.getContractFactory("FeedManager");

    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    userProfile = await UserProfile.deploy();

    followManager = await FollowManager.deploy(userProfile.address);

    postManager = await PostManager.deploy(userProfile.address);

    feedManager = await FeedManager.deploy(
      followManager.address,
      postManager.address,
      userProfile.address
    );

    await userProfile.connect(addr1).createProfile("alice", "bio1", "avatarCID1");
    await userProfile.connect(addr2).createProfile("bob", "bio2", "avatarCID2");
    await userProfile.connect(addr3).createProfile("charlie", "bio3", "avatarCID3");
  });

  describe("Feed Generation", function () {
    beforeEach(async function () {
      await postManager.connect(addr1).createPost("postCID1");
      await postManager.connect(addr1).createPost("postCID2");
      await postManager.connect(addr2).createPost("postCID3");
      await postManager.connect(addr3).createPost("postCID4");
      
      await followManager.connect(addr1).follow(addr2.address); // Alice follows Bob
      await followManager.connect(addr1).follow(addr3.address); // Alice follows Charlie
    });

    it("Should get feed post count for a user", async function () {
      const postCount = await feedManager.connect(addr1).getFeedPostCount();
      expect(postCount).to.equal(2);
    });

    it("Should generate feed with posts from followed users", async function () {
      const feed = await feedManager.connect(addr1).getFeed(0);
      
      expect(feed.length).to.equal(2);
      
      expect(feed[0].author).to.equal(addr3.address); 
      expect(feed[1].author).to.equal(addr2.address); 
    });

    it("Should return empty feed for user with no followed accounts", async function () {
      const feed = await feedManager.connect(addr2).getFeed(0);
      expect(feed.length).to.equal(0);
    });

    it("Should paginate feed correctly", async function () {
      await postManager.connect(addr2).createPost("postCID5");
      await postManager.connect(addr2).createPost("postCID6");
      await postManager.connect(addr2).createPost("postCID7");
      await postManager.connect(addr2).createPost("postCID8");
      
      const feedPage0 = await feedManager.connect(addr1).getFeed(0);
      
      const feedPage1 = await feedManager.connect(addr1).getFeed(1);
      
      expect(feedPage0.length + feedPage1.length).to.equal(6);
    });

    it("Should reject feed requests from unregistered users", async function () {
      await expect(
        feedManager.connect(owner).getFeed(0)
      ).to.be.revertedWith("Caller not registered");
    });
  });
});
