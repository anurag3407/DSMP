const { ethers } = require("hardhat");

async function main() {
  console.log("Starting deployment...\n");

  // Deploy UserProfile
  const UserProfile = await ethers.getContractFactory("UserProfile");
  const userProfile = await UserProfile.deploy();
  await userProfile.deployed();
  console.log("UserProfile deployed to:", userProfile.address);

  // Deploy PostManager
  const PostManager = await ethers.getContractFactory("PostManager");
  const postManager = await PostManager.deploy(userProfile.address);
  await postManager.deployed();
  console.log("PostManager deployed to:", postManager.address);

  // Deploy FollowManager
  const FollowManager = await ethers.getContractFactory("FollowManager");
  const followManager = await FollowManager.deploy(userProfile.address);
  await followManager.deployed();
  console.log("FollowManager deployed to:", followManager.address);

  // Deploy LikeManager
  const LikeManager = await ethers.getContractFactory("LikeManager");
  const likeManager = await LikeManager.deploy(postManager.address, userProfile.address);
  await likeManager.deployed();
  console.log("LikeManager deployed to:", likeManager.address);

  // Deploy CommentManager
  const CommentManager = await ethers.getContractFactory("CommentManager");
  const commentManager = await CommentManager.deploy(postManager.address, userProfile.address);
  await commentManager.deployed();
  console.log("CommentManager deployed to:", commentManager.address);

  // Deploy FeedManager
  const FeedManager = await ethers.getContractFactory("FeedManager");
  const feedManager = await FeedManager.deploy(followManager.address, postManager.address, userProfile.address);
  await feedManager.deployed();
  console.log("FeedManager deployed to:", feedManager.address);

  console.log("\n=== Deployment Complete ===");
  console.log("\nUpdate frontend/src/contracts/addresses.js with:");
  console.log(`export const CONTRACT_ADDRESSES = {
  UserProfile: "${userProfile.address}",
  PostManager: "${postManager.address}",
  FollowManager: "${followManager.address}",
  LikeManager: "${likeManager.address}",
  CommentManager: "${commentManager.address}",
  FeedManager: "${feedManager.address}"
};`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
