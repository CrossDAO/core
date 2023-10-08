import { ethers } from "ethers";
import type { NextApiRequest, NextApiResponse } from "next";
import governanceAbi from "~~/abi/governanceAbi.json";

const polygonMumbai = new ethers.JsonRpcProvider(
  `https://polygon-mumbai.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
);
const baseGoerli = new ethers.JsonRpcProvider(
  `https://base-goerli.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
);

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  try {
    const baseGoerliContract = new ethers.Contract(
      process.env.NEXT_PUBLIC_BASE_GOERLI_CONTRACT_ADDRESS as string,
      governanceAbi,
      baseGoerli,
    );
    const mumbaiContract = new ethers.Contract(
      process.env.NEXT_PUBLIC_MUMBAI_CONTRACT_ADDRESS as string,
      governanceAbi,
      polygonMumbai,
    );

    const baseGoerliTotalProposals = await baseGoerliContract.totalProposals();
    const mumbaiTotalProposals = await mumbaiContract.totalProposals();

    const baseGoerliProposals = [];
    for (let i = 0; i < Number(baseGoerliTotalProposals); i++) {
      const proposal = await baseGoerliContract.baseProposals(i);
      const [title, description] = proposal[2].split(":");

      const crossChainVotes = (await mumbaiContract.crossChainProposals("30", proposal[0]))[5];

      baseGoerliProposals.push({
        id: proposal[0],
        title,
        description,
        baseChainVotes: proposal[7],
        otherChainVotes: crossChainVotes,
        chainId: 84531,
      });
    }

    const mumbaiProposals = [];
    for (let i = 0; i < Number(mumbaiTotalProposals); i++) {
      const proposal = await mumbaiContract.baseProposals(i);
      const [title, description] = proposal[2].split(":");

      const crossChainVotes = (await baseGoerliContract.crossChainProposals("5", proposal[0]))[5];

      mumbaiProposals.push({
        id: proposal[0],
        title,
        description,
        baseChainVotes: proposal[7],
        otherChainVotes: crossChainVotes,
        chainId: 80001,
      });
    }

    const proposals = [...baseGoerliProposals, ...mumbaiProposals];

    return res.json(proposals);
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
}
