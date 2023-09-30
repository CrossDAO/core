import { ethers } from "hardhat";
import { supportedNetworks } from "./common";
import fs from "fs";

async function main() {
  // check if the network is supported
  const network = await ethers.provider.getNetwork();
  const networkName = supportedNetworks[network.chainId];
  if (networkName == undefined) throw "Unsupported Chain";

  // check if contract already deployed to the selected network
  const filePath = `./deployments/${networkName}.json`;

  if (!fs.existsSync(filePath))
    throw "Cannot find deployed contracts on the selected chain";

  const { address } = JSON.parse(fs.readFileSync(filePath).toString("utf-8"));

  const Governor = await ethers.getContractFactory("Governor");
  const governor = Governor.attach(address);

  const beneficiary = await (await ethers.getSigners())[0].getAddress();
  const tx = await governor.withdrawLinkTokens(beneficiary);
  await tx.wait(1);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
