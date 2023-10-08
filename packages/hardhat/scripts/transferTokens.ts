import { supportedNetworks } from "./common";
import fs from "fs";
import { ethers } from "hardhat";

const receipient = "0x06d67c0F18a4B2055dF3C22201f351B131843970";

async function main() {
  // check if the network is supported
  const network = await ethers.provider.getNetwork();
  const networkName = supportedNetworks[network.chainId];
  if (networkName == undefined) throw "Unsupported Chain";

  // check if contract already deployed to the selected network
  const filePath = `./deployments/${networkName}.json`;

  if (!fs.existsSync(filePath)) throw "Cannot find deployed contracts on the selected chain";

  const { token: address } = JSON.parse(fs.readFileSync(filePath).toString("utf-8"));

  const Token = await ethers.getContractFactory("MockToken");
  const token = Token.attach(address);

  const gasPrice = await ethers.provider.getGasPrice();

  await token.transfer(receipient, ethers.utils.parseEther("1000"), { gasPrice });
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
