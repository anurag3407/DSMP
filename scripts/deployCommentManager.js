const { ethers } = require("hardhat");

// Existing deployed contract addresses on Sepolia
const DEPLOYED_ADDRESSES = {
    UserProfile: "0x67bD30F17554A4828A079BA6dE7968cF35B841d9",
    PostManager: "0x9c3Fd462Ac279abF8Ce1fe4F19578C6b99729E37"
};

async function main() {
    console.log("Starting CommentManager deployment...\n");

    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);

    const balance = await deployer.getBalance();
    console.log("Account balance:", ethers.utils.formatEther(balance), "ETH\n");

    if (balance.eq(0)) {
        throw new Error("Deployer account has no ETH. Please fund your wallet with Sepolia ETH.");
    }

    // Deploy CommentManager
    console.log("Deploying CommentManager...");
    console.log("  PostManager address:", DEPLOYED_ADDRESSES.PostManager);
    console.log("  UserProfile address:", DEPLOYED_ADDRESSES.UserProfile);

    const CommentManager = await ethers.getContractFactory("CommentManager");
    const commentManager = await CommentManager.deploy(
        DEPLOYED_ADDRESSES.PostManager,
        DEPLOYED_ADDRESSES.UserProfile
    );
    await commentManager.deployed();

    console.log("\n=== Deployment Complete ===");
    console.log("CommentManager deployed to:", commentManager.address);
    console.log("\nUpdate frontend/src/contracts/addresses.js:");
    console.log(`  CommentManager: "${commentManager.address}"`);
    console.log("\nView on Etherscan:");
    console.log(`  https://sepolia.etherscan.io/address/${commentManager.address}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Deployment failed:", error);
        process.exit(1);
    });
