import fs from "fs";
import { ethers } from "hardhat";
import { supportedNetworks, chains } from "./common";

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

  const deployedNetworks = fs
    .readdirSync("./deployment")
    .map((fileName) => fileName.split(".")[0])
    .filter((deploymentChain) => deploymentChain !== networkName)
    .map((deploymentChain) => {
      const { address } = JSON.parse(
        fs
          .readFileSync(`./deployment/${deploymentChain}.json`)
          .toString("utf-8")
      );
      return {
        address,
        chain: deploymentChain,
        ...chains[deploymentChain],
      };
    });

  for (const deployedNetworkInfo of deployedNetworks) {
    await governor.addSupportedContract(
      deployedNetworkInfo.selector,
      deployedNetworkInfo.address
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
