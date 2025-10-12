const hre = require("hardhat");

async function main() {
  const UserProfile = await hre.ethers.getContractFactory("UserProfile");
  const FollowManager = await hre.ethers.getContractFactory("FollowManager");
  const PostManager = await hre.ethers.getContractFactory("PostManager");
  const FeedManager = await hre.ethers.getContractFactory("FeedManager");

  console.log("Deploying UserProfile...");
  const userProfile = await UserProfile.deploy();
  await userProfile.waitForDeployment();
  console.log("👌 UserProfile deployed to:", userProfile.target);

  console.log("Deploying FollowManager...");
  const followManager = await FollowManager.deploy(userProfile.target);
  await followManager.waitForDeployment();
  console.log("👌 FollowManager deployed to:", followManager.target);

  console.log("Deploying PostManager...");
  const postManager = await PostManager.deploy(userProfile.target);
  await postManager.waitForDeployment();
  console.log("👌 PostManager deployed to:", postManager.target);

  console.log("Deploying FeedManager...");
  const feedManager = await FeedManager.deploy(
    followManager.target,
    postManager.target,
    userProfile.target
  );
  await feedManager.waitForDeployment();
  console.log("👌 FeedManager deployed to:", feedManager.target);

  console.log("\n--- Deployed Contract Addresses ---");
  console.log("UserProfile:", userProfile.target);
  console.log("FollowManager:", followManager.target);
  console.log("PostManager:", postManager.target);
  console.log("FeedManager:", feedManager.target);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
