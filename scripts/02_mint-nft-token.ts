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

  const tx = await songjamSBT.mint();
  console.log("Transaction Hash: ", tx.hash);
  await tx.wait();
  console.log("Token minted successfully");
 
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
