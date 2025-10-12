const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("UserProfile", function () {
  let UserProfile;
  let userProfile;
  let owner;
  let addr1;

    beforeEach(async function () {
    UserProfile = await ethers.getContractFactory("UserProfile");
    [owner, addr1] = await ethers.getSigners();
    userProfile = await UserProfile.deploy();
  });

  describe("Profile Creation", function () {
    it("Should allow a user to create a profile", async function () {
      await userProfile.connect(addr1).createProfile("alice", "bio", "avatarCID");
      const profile = await userProfile.getProfile(addr1.address);
      expect(profile.username).to.equal("alice");
      expect(profile.bio).to.equal("bio");
      expect(profile.avatarCID).to.equal("avatarCID");
      expect(profile.wallet).to.equal(addr1.address);
    });

    it("Should not allow creating a profile twice", async function () {
      await userProfile.connect(addr1).createProfile("alice", "bio", "avatarCID");
      await expect(
        userProfile.connect(addr1).createProfile("alice2", "bio2", "avatarCID2")
      ).to.be.revertedWith("Profile already exists");
    });
  });

  describe("Profile Update", function () {
    it("Should allow a registered user to update their profile", async function () {
      await userProfile.connect(addr1).createProfile("alice", "bio", "avatarCID");
      await userProfile.connect(addr1).updateProfile("alice2", "bio2", "avatarCID2");
      const profile = await userProfile.getProfile(addr1.address);
      expect(profile.username).to.equal("alice2");
      expect(profile.bio).to.equal("bio2");
      expect(profile.avatarCID).to.equal("avatarCID2");
    });

    it("Should not allow unregistered user to update profile", async function () {
      await expect(
        userProfile.connect(addr1).updateProfile("alice2", "bio2", "avatarCID2")
      ).to.be.revertedWith("User not registered");
    });
  });

  describe("User Registration Check", function () {
    it("Should return true for registered user", async function () {
      await userProfile.connect(addr1).createProfile("alice", "bio", "avatarCID");
      expect(await userProfile.isUserRegistered(addr1.address)).to.equal(true);
    });

    it("Should return false for unregistered user", async function () {
      expect(await userProfile.isUserRegistered(addr1.address)).to.equal(false);
    });
  });
});
