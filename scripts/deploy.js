const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying SomniaPersonaNFT to", hre.network.name);
  
  const SomniaPersonaNFT = await hre.ethers.getContractFactory("SomniaPersonaNFT");
  
  console.log("⏳ Deploying contract...");
  const contract = await SomniaPersonaNFT.deploy();
  
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  
  console.log("✅ SomniaPersonaNFT deployed to:", address);
  console.log("📝 Save this address for frontend integration!");
  
  console.log("\n📊 Contract Info:");
  console.log("- Name:", await contract.name());
  console.log("- Symbol:", await contract.symbol());
  console.log("- Owner:", await contract.owner());
  
  console.log("\n🔧 Next steps:");
  console.log("1. Copy contract address:", address);
  console.log("2. Update personas.html with contract address");
  console.log("3. Verify on Somnia Explorer");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exitCode = 1;
  });
