import Proposal from "./ProposalItem";
import Spinner from "./Spinner";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const mockedProposals = [
  {
    id: 1,
    title: "New proposal",
    description: "This is some proposal that needs voting",
    chainId: 1,
  },
];

const ProposalsList = () => {
  const {
    data: proposals = [],
    isLoading: isFetchingProposals,
    refetch: refetchProposals,
  } = useQuery({
    queryKey: ["proposals"],
    queryFn: async () => {
      const response = await axios.get("/api/proposals").catch(err => {
        console.error(err);
        return { data: [] };
      });

      return response.data;
    },
  });

  if (isFetchingProposals) {
    return (
      <div className="flex items-center flex-col flex-grow pt-10 max-w-5xl m-auto w-full">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      <div className="gap-4 flex flex-col pb-10">
        <div className="flex justify-end">
          <button className="border rounded-full transition-colors border-base-200 hover:border-base-100 mt-6 text-white px-4 py-2 mb-4 text-center flex gap-2 justify-center">
            New Proposal
          </button>
        </div>

        {mockedProposals?.map((item: any, i: number) => (
          <Proposal key={i} proposal={item} />
        ))}
      </div>
    </>
  );
};

export default ProposalsList;
