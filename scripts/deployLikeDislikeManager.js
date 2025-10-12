const { ethers } = require("hardhat");

async function main() {
  const LikeDislikeManager = await ethers.getContractFactory("LikeDislikeManager");
  const likeDislikeManager = await LikeDislikeManager.deploy();
  await likeDislikeManager.waitForDeployment();

  console.log("👌 LikeDislikeManager deployed to:", likeDislikeManager.target);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
