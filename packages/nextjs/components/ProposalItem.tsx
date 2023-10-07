import Image from "next/image";
import { useRouter } from "next/router";
import { chainLogos } from "../constants";

export interface IProposal {
  id: number;
  title: string;
  description: string;
  chainId: number;
  baseChainVotes: string[];
  otherChainVotes: string[];
}

interface ProposalProps {
  proposal: IProposal;
}

const Proposal = ({ proposal }: ProposalProps) => {
  const router = useRouter();

  const chainImage = chainLogos[proposal.chainId as keyof typeof chainLogos];

  return (
    <>
      <div
        className="card shadow-xl m-auto w-full border hover:border-base-100 border-base-200 cursor-pointer transition-colors"
        onClick={() => router.push(`/proposal/${proposal.id}`)}
      >
        <div className="card-body p-6">
          <div className="flex gap-4">
            {chainImage && (
              <div>
                <Image src={chainImage} width={30} height={30} alt="" />
              </div>
            )}
            <div className="flex-1 flex flex-col gap-2">
              <h2 className="text-2xl font-bold text-purple-400">{proposal.title}</h2>
              <p className="text-xl  text-white">{proposal.description}</p>
            </div>
            <div className="text-right">
              <p>Base Chain votes: {proposal.baseChainVotes?.[0] || 0}</p>
              <p>Other Chains votes: {proposal.otherChainVotes?.[0] || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Proposal;
