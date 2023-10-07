import { supportedNetworks } from "../scripts/common";
import fs from "fs";
import { ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const depositingFunds: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // check if the network is supported
  const network = await ethers.provider.getNetwork();
  const networkName = supportedNetworks[network.chainId];
  if (networkName == undefined) throw "Unsupported Chain";

  // check if contract already deployed to the selected network
  const filePath = `./deployments/${networkName}.json`;

  if (!fs.existsSync(filePath)) throw "Cannot find deployed contracts on the selected chain";

  const { address } = JSON.parse(fs.readFileSync(filePath).toString("utf-8"));

  const signer = (await ethers.getSigners())[0];

  const gasPrice = await ethers.provider.getGasPrice();

  const tx = await signer.sendTransaction({ to: address, value: ethers.utils.parseEther("0.03"), gasPrice });
  await tx.wait(1);
};

export default depositingFunds;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
depositingFunds.tags = ["fund-contract"];
