import { ethers } from "hardhat";
import fs from "fs";
import path from "path";
import { chains, supportedNetworks } from "./common";

const linkDepositAmount = ethers.utils.parseEther("0.5");

async function writeJSONToFile(
  data: any,
  fileName: string,
  dirPath = "./deployments"
) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath);

  const filePath = path.join(dirPath, fileName);

  if (fs.existsSync(filePath)) return false;

  fs.writeFileSync(filePath, JSON.stringify(data));
  return true;
}

async function main() {
  // check if the network is supported
  const network = await ethers.provider.getNetwork();
  const networkName = supportedNetworks[network.chainId];
  if (networkName == undefined) throw "Unsupported Chain";

  // check if contract already deployed to the selected network
  if (fs.existsSync(`./deployments/${networkName}.json`))
    throw "Contract already deployed to the selected network";

  // get the chain info
  const info = chains[networkName];

  // deploy the governor contract
  const Governor = await ethers.getContractFactory("MockGovernor");
  const governor = await Governor.deploy(info.router, info.linkToken);

  await governor.deployTransaction.wait(1);
  console.log(`The governor contract is deployed at ${governor.address}`);

  // create the contract deployment file
  const fileName = `${networkName}.json`;
  const data = { address: governor.address };
  writeJSONToFile(data, fileName);

  // transfer the required link token to the governor contract
  const ERC20 = await ethers.getContractFactory("ERC20");
  const linkToken = ERC20.attach(info.linkToken);

  const tx = await linkToken.transfer(governor.address, linkDepositAmount);
  await tx.wait(1);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
