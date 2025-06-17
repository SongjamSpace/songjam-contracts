import { ethers, network } from "hardhat";
import { SongjamSBT, SongjamSBT__factory } from "../typechain-types";
const addresses = require("./address.json");

async function main() {

  const [owner, addr1] = await ethers.getSigners();
  console.log("Network = ",network.name);
  console.log("Owner address = ",owner.address);
  
  const SongjamSBT:SongjamSBT__factory = await ethers.getContractFactory("SongjamSBT");
  const songjamSBT:SongjamSBT = await SongjamSBT.attach(addresses[network.name].songjamSBT);

  console.log("SongjamSBT Address: ", songjamSBT.address);

  const tokenId = 0; // Replace with the token ID you want to burn
  
  // Check burn authorization before burning
  const burnAuth = await songjamSBT.burnAuth(tokenId);
  console.log(`Token ${tokenId} burn authorization: ${burnAuth}`);
  
  const tx = await songjamSBT.burn(tokenId);
  console.log("Transaction Hash: ", tx.hash);
  await tx.wait();
  console.log(`Token ${tokenId} burned successfully`);
 
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 