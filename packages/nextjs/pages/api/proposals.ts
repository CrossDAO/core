import { ethers } from "ethers";
import type { NextApiRequest, NextApiResponse } from "next";
import governanceAbi from "~~/abi/governanceAbi.json";

const polygonMumbai = new ethers.JsonRpcProvider(
  `https://polygon-mumbai.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
);
const avalancheFuji = new ethers.JsonRpcProvider(
  `https://avalanche-fuji.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
);

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  try {
    const fujiContract = new ethers.Contract(
      process.env.NEXT_PUBLIC_FUJI_CONTRACT_ADDRESS as string,
      governanceAbi,
      avalancheFuji,
    );
    const mumbaiContract = new ethers.Contract(
      process.env.NEXT_PUBLIC_MUMBAI_CONTRACT_ADDRESS as string,
      governanceAbi,
      polygonMumbai,
    );

    const fujiTotalProposals = await fujiContract.totalProposals();
    const mumbaiTotalProposals = await mumbaiContract.totalProposals();

    const fujiProposals = [];
    for (let i = 0; i < Number(fujiTotalProposals); i++) {
      const proposal = await fujiContract.baseProposals(i);
      const [title, description] = proposal[2].split(":");

      const crossChainVotes = (await mumbaiContract.crossChainProposals("14767482510784806043", proposal[0]))[5];

      fujiProposals.push({
        id: proposal[0],
        title,
        description,
        baseChainVotes: proposal[7],
        otherChainVotes: crossChainVotes,
        chainId: 43113,
      });
    }

    const mumbaiProposals = [];
    for (let i = 0; i < Number(mumbaiTotalProposals); i++) {
      const proposal = await mumbaiContract.baseProposals(i);
      const [title, description] = proposal[2].split(":");

      const crossChainVotes = (await fujiContract.crossChainProposals("12532609583862916517", proposal[0]))[5];

      mumbaiProposals.push({
        id: proposal[0],
        title,
        description,
        baseChainVotes: proposal[7],
        otherChainVotes: crossChainVotes,
        chainId: 80001,
      });
    }

    const proposals = [...fujiProposals, ...mumbaiProposals];

    return res.json(proposals);
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
}
