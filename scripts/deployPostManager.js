const hre = require("hardhat");

async function main() {
  const PostManager = await hre.ethers.getContractFactory("PostManager");
  const postManager = await PostManager.deploy();

  await postManager.waitForDeployment();

  console.log(`👌 PostManager deployed to: ${postManager.target}`);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
