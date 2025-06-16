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


  // Note: This will fail since SBTs are now non-transferable (soulbound)
  try {
    const tx = await songjamSBT["safeTransferFrom(address,address,uint256)"](owner.address, "0x07C920eA4A1aa50c8bE40c910d7c4981D135272B", 0);
    console.log("Transaction Hash: ", tx.hash);
    await tx.wait();
    console.log("Token transferred successfully");
  } catch (error: any) {
    console.log("Transfer failed as expected - SBTs are non-transferable:", error.message);
  }

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
