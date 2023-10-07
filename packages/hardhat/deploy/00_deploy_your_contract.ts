import { chains, supportedNetworks } from "../scripts/common";
import fs from "fs";
import { ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import path from "path";

/**
 * Deploys a contract named "YourContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */

async function writeJSONToFile(data: any, fileName: string, dirPath = "./deployments") {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath);

  const filePath = path.join(dirPath, fileName);

  if (fs.existsSync(filePath)) return false;

  fs.writeFileSync(filePath, JSON.stringify(data));
  return true;
}

const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network goerli`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // check if the network is supported
  const network = await ethers.provider.getNetwork();
  const networkName = supportedNetworks[network.chainId];
  if (networkName == undefined) throw "Unsupported Chain";

  // check if contract already deployed to the selected network
  if (fs.existsSync(`./deployments/${networkName}.json`)) throw "Contract already deployed to the selected network";

  // get the chain info
  const info = chains[networkName];

  // deploy the test governance token
  const token = await deploy("MockToken", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
    waitConfirmations: 1,
  });

  console.log(token.address);

  // deploy the governor contract
  const governor = await deploy("GovernorV2", {
    from: deployer,
    // Contract constructor arguments
    args: [token.address, info.relayer],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
    waitConfirmations: 1,
  });

  console.log(`The governor contract is deployed at ${governor.address}`);

  // create the contract deployment file
  const fileName = `${networkName}.json`;
  const data = { token: token.address, address: governor.address };
  writeJSONToFile(data, fileName);
};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployYourContract.tags = ["contract-deployment"];
