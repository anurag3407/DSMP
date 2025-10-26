const hre = require("hardhat");

async function main() {
  console.log("Deploying DecentralizedSocialMedia contract to Sepolia...");

  const DecentralizedSocialMedia = await hre.ethers.getContractFactory("DecentralizedSocialMedia");
  const contract = await DecentralizedSocialMedia.deploy();

  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();

  console.log("DecentralizedSocialMedia deployed to:", contractAddress);
  console.log("Save this address to your .env file as CONTRACT_ADDRESS");
  
  // Wait for block confirmations
  console.log("Waiting for block confirmations...");
  await contract.deploymentTransaction().wait(6);
  
  console.log("Contract deployed and verified!");
  console.log("Contract owner:", await contract.owner());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
