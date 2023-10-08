import { syncEvents } from "./web3Listeners";
import dotenv from "dotenv";
import { ethers } from "ethers";

dotenv.config();

const supportedChains = {
  "polygon-mumbai": {
    id: 6,
    token: "0x07e7dA1c834EF1AbF6fDE816A98300DCd6Ead315",
    address: "0x470841a01F293dc88b0aE56718B0a3018cA83E82",
    provider: new ethers.WebSocketProvider(
      process.env.POLYGON_MUMBAI_RPC_URL || ""
    ),
    minBlock: 40950724,
  },
  "base-goerli": {
    id: 30,
    token: "0x07e7dA1c834EF1AbF6fDE816A98300DCd6Ead315",
    address: "0x470841a01F293dc88b0aE56718B0a3018cA83E82",
    provider: new ethers.WebSocketProvider(
      process.env.BASE_GOERLI_RPC_URL || ""
    ),
    minBlock: 10758996,
  },
};

async function main() {
  const listeners: Promise<void>[] = [];

  for (const networkConfig of Object.values(supportedChains)) {
    listeners.push(syncEvents(networkConfig));
  }

  await Promise.all(listeners);
}

main();
