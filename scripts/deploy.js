const { ethers } = require("hardhat");

async function main() {
  // Deploy UserProfile
  const UserProfile = await ethers.getContractFactory("UserProfile");
  const userProfile = await UserProfile.deploy();
  console.log("UserProfile deployed to:", userProfile.address);

  // Deploy PostManager
  const PostManager = await ethers.getContractFactory("PostManager");
  const postManager = await PostManager.deploy(userProfile.address);
  console.log("PostManager deployed to:", postManager.address);

  // Deploy FollowManager
  const FollowManager = await ethers.getContractFactory("FollowManager");
  const followManager = await FollowManager.deploy(userProfile.address);
  console.log("FollowManager deployed to:", followManager.address);

  // Deploy LikeManager
  const LikeManager = await ethers.getContractFactory("LikeManager");
  const likeManager = await LikeManager.deploy(postManager.address, userProfile.address);
  console.log("LikeManager deployed to:", likeManager.address);

  // Deploy FeedManager
  const FeedManager = await ethers.getContractFactory("FeedManager");
  const feedManager = await FeedManager.deploy(followManager.address, postManager.address, userProfile.address);
  console.log("FeedManager deployed to:", feedManager.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
