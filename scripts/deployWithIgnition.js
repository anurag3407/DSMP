const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const { ignition } = require("hardhat");

const NounceModule = require("../ignition/modules/Nounce");

async function main() {
  const network = process.env.HARDHAT_NETWORK || "hardhat";
  console.log(`Deploying contracts using Ignition to ${network} network...`);
  
  const { userProfile, followManager, postManager, likeManager, commentManager, feedManager } = 
    await ignition.deploy(NounceModule);

  console.log("\n--- Deployed Contract Addresses ---");
  console.log("UserProfile:", await userProfile.getAddress());
  console.log("FollowManager:", await followManager.getAddress());
  console.log("PostManager:", await postManager.getAddress());
  console.log("LikeManager:", await likeManager.getAddress());
  console.log("CommentManager:", await commentManager.getAddress());
  console.log("FeedManager:", await feedManager.getAddress());
  console.log("\n👌 All contracts deployed successfully!");
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
