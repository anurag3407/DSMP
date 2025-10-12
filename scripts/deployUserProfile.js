const hre = require("hardhat");

async function main() {
  const userProfile = await hre.ethers.deployContract("UserProfile");

  await userProfile.waitForDeployment();

  console.log("👌 UserProfile deployed to:", userProfile.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
