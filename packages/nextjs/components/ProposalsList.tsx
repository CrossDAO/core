import { useRouter } from "next/router";
import Proposal from "./ProposalItem";
import Spinner from "./Spinner";
import { useGetProposals } from "~~/api/getProposals";

const ProposalsList = () => {
  const router = useRouter();

  const {
    data: proposals = [],
    isLoading: isFetchingProposals,
    // refetch: refetchProposals,
  } = useGetProposals();

  if (isFetchingProposals) {
    return (
      <div className="flex items-center flex-col flex-grow pt-10 max-w-5xl m-auto w-full">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      <div className="gap-4 flex flex-col pb-10 mt-6">
        <div className="flex justify-end">
          <button
            className="border rounded-full transition-colors border-base-200 hover:border-base-100  text-white px-4 py-2 text-center flex gap-2 justify-center"
            onClick={() => router.push("/create")}
          >
            New Proposal
          </button>
        </div>

        {proposals?.map((item: any, i: number) => (
          <Proposal key={i} proposal={item} />
        ))}
      </div>
    </>
  );
};

export default ProposalsList;
