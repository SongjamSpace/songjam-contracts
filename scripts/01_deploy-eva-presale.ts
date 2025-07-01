import { ethers, network } from "hardhat";
import { EvaPresaleTest, EvaPresaleTest__factory } from "../typechain-types";
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const [owner, addr1] = await ethers.getSigners();
  console.log("Network = ", network.name);
  console.log("Owner address = ", owner.address);

  // Presale parameters (in ETH)
  const softCap = ethers.utils.parseEther("0.03");      // 0.01 ETH minimum to raise
  const hardCap = ethers.utils.parseEther("0.04");      // 0.04 ETH maximum to raise
  const minContribution = ethers.utils.parseEther("0.001");  // 0.001 ETH minimum per contributor
  const maxContribution = ethers.utils.parseEther("0.01");    // 0.005 ETH maximum per contributor

  console.log("Deploying EvaPresaleTest with parameters:");
  console.log("Soft Cap:", ethers.utils.formatEther(softCap), "ETH");
  console.log("Hard Cap:", ethers.utils.formatEther(hardCap), "ETH");
  console.log("Min Contribution:", ethers.utils.formatEther(minContribution), "ETH");
  console.log("Max Contribution:", ethers.utils.formatEther(maxContribution), "ETH");

  const EvaPresaleTest: EvaPresaleTest__factory = await ethers.getContractFactory("EvaPresaleTest");
  const evaPresale: EvaPresaleTest = await EvaPresaleTest.deploy(
    softCap,
    hardCap,
    minContribution,
    maxContribution
  );
  
  await evaPresale.deployed();
  console.log("EvaPresaleTest deployed to: ", evaPresale.address);

  // Verify deployment by checking initial state
  console.log("\nVerifying deployment...");
  const deployedSoftCap = await evaPresale.softCap();
  const deployedHardCap = await evaPresale.hardCap();
  const deployedMinContribution = await evaPresale.minContribution();
  const deployedMaxContribution = await evaPresale.maxContribution();
  const ownerAddress = await evaPresale.owner();

  console.log("Deployed Soft Cap:", ethers.utils.formatEther(deployedSoftCap), "ETH");
  console.log("Deployed Hard Cap:", ethers.utils.formatEther(deployedHardCap), "ETH");
  console.log("Deployed Min Contribution:", ethers.utils.formatEther(deployedMinContribution), "ETH");
  console.log("Deployed Max Contribution:", ethers.utils.formatEther(deployedMaxContribution), "ETH");
  console.log("Contract Owner:", ownerAddress);

  // Check if owner matches
  if (ownerAddress === owner.address) {
    console.log("✅ Owner verification successful");
  } else {
    console.log("❌ Owner verification failed");
  }

  // Save contract address to address.json
  const addressFilePath = path.join(__dirname, 'address.json');
  let addresses: { [key: string]: { [key: string]: string } } = {};
  
  try {
    const addressFileContent = fs.readFileSync(addressFilePath, 'utf8');
    addresses = JSON.parse(addressFileContent);
  } catch (error) {
    console.log("Creating new address.json file");
  }

  // Initialize network if it doesn't exist
  if (!addresses[network.name]) {
    addresses[network.name] = {};
  }

  // Add the new contract address
  addresses[network.name].evaPresale = evaPresale.address;

  // Write back to file
  fs.writeFileSync(addressFilePath, JSON.stringify(addresses, null, 4));
  console.log("✅ Contract address saved to address.json");

  console.log("\nDeployment completed successfully!");
  console.log("Next steps:");
  console.log("1. Run: npx hardhat run scripts/02_start-eva-presale.ts --network", network.name);
  console.log("2. Run: npx hardhat run scripts/03_contribute-to-presale.ts --network", network.name);
  console.log("3. Run: npx hardhat run scripts/04_finalize-presale.ts --network", network.name);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 