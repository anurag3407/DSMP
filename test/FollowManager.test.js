const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FollowManager", function () {
  let UserProfile, FollowManager;
  let userProfile, followManager;
  let owner, addr1, addr2;

    beforeEach(async function () {
    UserProfile = await ethers.getContractFactory("UserProfile");
    FollowManager = await ethers.getContractFactory("FollowManager");
    [owner, addr1, addr2] = await ethers.getSigners();

    userProfile = await UserProfile.deploy();

    followManager = await FollowManager.deploy(userProfile.address);
    await userProfile.connect(addr1).createProfile("alice", "bio", "avatarCID");
    await userProfile.connect(addr2).createProfile("bob", "bio2", "avatarCID2");
  });

  describe("Follow and Unfollow", function () {
    it("Should allow a registered user to follow another registered user", async function () {
      await followManager.connect(addr1).follow(addr2.address);
      expect(await followManager.isUserFollowing(addr1.address, addr2.address)).to.equal(true);

      const followers = await followManager.getFollowers(addr2.address);
      expect(followers.length).to.equal(1);
      expect(followers[0]).to.equal(addr1.address);

      const following = await followManager.getFollowing(addr1.address);
      expect(following.length).to.equal(1);
      expect(following[0]).to.equal(addr2.address);
    });

    it("Should not allow a user to follow themselves", async function () {
      await expect(
        followManager.connect(addr1).follow(addr1.address)
      ).to.be.revertedWith("Cannot follow yourself");
    });

    it("Should not allow following a user twice", async function () {
      await followManager.connect(addr1).follow(addr2.address);
      await expect(
        followManager.connect(addr1).follow(addr2.address)
      ).to.be.revertedWith("Already following");
    });

    it("Should allow a user to unfollow a followed user", async function () {
      await followManager.connect(addr1).follow(addr2.address);
      await followManager.connect(addr1).unfollow(addr2.address);
      expect(await followManager.isUserFollowing(addr1.address, addr2.address)).to.equal(false);

      const followers = await followManager.getFollowers(addr2.address);
      expect(followers.length).to.equal(0);

      const following = await followManager.getFollowing(addr1.address);
      expect(following.length).to.equal(0);
    });

    it("Should not allow unfollowing a user not followed", async function () {
      await expect(
        followManager.connect(addr1).unfollow(addr2.address)
      ).to.be.revertedWith("Not following");
    });
  });
});
