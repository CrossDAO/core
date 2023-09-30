import { ethers } from "hardhat";

async function main() {
  const Governor = await ethers.getContractFactory("Governor");
  const governor = await Governor.deploy();

  await governor.deployed();

  console.log(`The governor contract is deployed at ${governor.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
