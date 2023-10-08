import Image from "next/image";
import { useRouter } from "next/router";
import type { NextPage } from "next";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useGetProposals } from "~~/api/getProposals";
import ProposalDetails from "~~/components/ProposalDetails";
import { IProposal } from "~~/components/ProposalItem";
import { chainLogos } from "~~/constants";

const Details: NextPage = () => {
  const router = useRouter();
  const { id = "" } = router.query;

  const [chainId, proposalId] = (id as string).split("-");

  const { data = [], isLoading } = useGetProposals();

  const proposal = data.find((p: IProposal) => p.id === proposalId && p.chainId === parseInt(chainId));

  const chainImage = chainLogos[proposal.chainId as keyof typeof chainLogos];

  return (
    <>
      <div className="flex flex-col flex-grow pt-10 max-w-2xl w-full m-auto">
        <button className="flex items-center gap-2 opacity-50 hover:opacity-100" onClick={() => router.push("/")}>
          <ArrowLeftIcon className="w-4 h-4" /> Back
        </button>

        <h1 className="my-6">
          {chainImage && (
            <div>
              <Image src={chainImage} width={30} height={30} alt="" className="mb-3" />
            </div>
          )}
          <span className="text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-400 break-all">
            {proposal?.title}
          </span>
        </h1>

        <ProposalDetails proposal={proposal} isLoading={isLoading} />
      </div>
    </>
  );
};

export default Details;
