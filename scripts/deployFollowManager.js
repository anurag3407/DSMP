const hre = require("hardhat");

async function main() {
  const FollowManager = await hre.ethers.deployContract("FollowManager");

  await FollowManager.waitForDeployment();

  console.log("👌FollowManager deployed to:", FollowManager.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
