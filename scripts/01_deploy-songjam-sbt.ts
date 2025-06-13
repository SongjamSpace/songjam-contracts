import { ethers, network } from "hardhat";
import { SongjamSBT, SongjamSBT__factory } from "../typechain-types";
async function main() {

  const [owner, addr1] = await ethers.getSigners();
  console.log("Network = ",network.name);
  console.log("Owner address = ",owner.address);
  
  const SongjamSBT:SongjamSBT__factory = await ethers.getContractFactory("SongjamSBT");
  const songjamSBT:SongjamSBT = await SongjamSBT.deploy(owner.address, "SongjamSBT", "SJSBT", "https://green-vicarious-wildcat-394.mypinata.cloud/ipfs/bafkreih52un25x5afl4mbxp3nxpnglatrjdzyoufg7szugwfmi66zf5lau");
  await songjamSBT.deployed();
  console.log("SongjamSBT deployed to: ", songjamSBT.address);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
