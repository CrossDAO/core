import { supportedNetworks, chains } from "../scripts/common";
import fs from "fs";
import { ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const connectingContracts: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // check if the network is supported
  const network = await ethers.provider.getNetwork();
  const networkName = supportedNetworks[network.chainId];
  if (networkName == undefined) throw "Unsupported Chain";

  // check if contract already deployed to the selected network
  const filePath = `./deployments/${networkName}.json`;

  if (!fs.existsSync(filePath)) throw "Cannot find deployed contracts on the selected chain";

  const { address } = JSON.parse(fs.readFileSync(filePath).toString("utf-8"));

  const Governor = await ethers.getContractFactory("GovernorV2");
  const governor = Governor.attach(address);

  const deployedNetworks = fs
    .readdirSync("./deployments")
    .filter(fileName => fileName.split(".")[fileName.split(".").length - 1] === "json")
    .map(fileName => fileName.split(".")[0])
    .filter(deploymentChain => deploymentChain !== networkName)
    .map(deploymentChain => {
      const { address } = JSON.parse(fs.readFileSync(`./deployments/${deploymentChain}.json`).toString("utf-8"));
      return {
        address,
        chain: deploymentChain,
        ...chains[deploymentChain],
      };
    });

  for (const deployedNetworkInfo of deployedNetworks) {
    const gasPrice = await ethers.provider.getGasPrice();

    await governor.addSupportedContract(deployedNetworkInfo.selector, deployedNetworkInfo.address, { gasPrice });
  }
};

export default connectingContracts;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
connectingContracts.tags = ["connect-contracts"];
