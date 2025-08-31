import { ethers, network } from "hardhat";
import { SongjamToken, SongjamToken__factory } from "../typechain-types";
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const [owner, addr1] = await ethers.getSigners();
  console.log("Network = ", network.name);
  console.log("Owner address = ", owner.address);

  console.log("Deploying SongjamToken...");

  const SongjamToken: SongjamToken__factory = await ethers.getContractFactory("SongjamToken");
  const songjamToken: SongjamToken = await SongjamToken.deploy(owner.address);
  
  await songjamToken.deployed();
  console.log("SongjamToken deployed to: ", songjamToken.address);

  // Verify deployment by checking initial state
  console.log("\nVerifying deployment...");
  const name = await songjamToken.name();
  const symbol = await songjamToken.symbol();
  const decimals = await songjamToken.decimals();
  const maxSupply = await songjamToken.MAX_SUPPLY();
  const totalSupply = await songjamToken.totalSupply();
  const remainingSupply = await songjamToken.getRemainingSupply();
  const ownerAddress = await songjamToken.owner();

  console.log("Token Name:", name);
  console.log("Token Symbol:", symbol);
  console.log("Token Decimals:", decimals);
  console.log("Max Supply:", ethers.utils.formatEther(maxSupply), "SONG");
  console.log("Total Supply:", ethers.utils.formatEther(totalSupply), "SONG");
  console.log("Remaining Supply:", ethers.utils.formatEther(remainingSupply), "SONG");
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
  addresses[network.name].songjamToken = songjamToken.address;

  // Write back to file
  fs.writeFileSync(addressFilePath, JSON.stringify(addresses, null, 4));
  console.log("✅ Contract address saved to address.json");

  console.log("\nDeployment completed successfully!");
  console.log("Next steps:");
  console.log("1. Run: npx hardhat run scripts/02_mint-tokens.ts --network", network.name);
  console.log("2. Run: npx hardhat run scripts/03_check-token-status.ts --network", network.name);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
