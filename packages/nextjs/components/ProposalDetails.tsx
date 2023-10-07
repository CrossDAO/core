import { useCallback, useState } from "react";
import { IProposal } from "./ProposalItem";
import Spinner from "./Spinner";
import classNames from "classnames";
import toast from "react-hot-toast";
import { Abi } from "viem";
import { avalancheFuji, polygonMumbai } from "viem/chains";
import { useNetwork } from "wagmi";
import { prepareWriteContract, waitForTransaction, writeContract } from "wagmi/actions";
import governanceAbi from "~~/abi/governanceAbi.json";
import { governanceContract } from "~~/constants";
import { queryClient } from "~~/services/react-query";

const chainSelectors = {
  [polygonMumbai.id]: "12532609583862916517",
  [avalancheFuji.id]: "14767482510784806043",
};

type ProposalDetailsProps = {
  proposal: IProposal;
  isLoading: boolean;
};

const ProposalDetails = ({ proposal, isLoading }: ProposalDetailsProps) => {
  const { chain } = useNetwork();

  const [vote, setVote] = useState<boolean | undefined>();
  const [isVoteLoading, setIsVoteLoading] = useState(false);

  const handleVoteTransaction = useCallback(async () => {
    if (!chain?.id) return;

    setIsVoteLoading(true);

    try {
      const { request } = await prepareWriteContract({
        address: governanceContract[chain.id],
        abi: governanceAbi as Abi,
        ...(chain.id === proposal.chainId
          ? {
              functionName: "voteOnBaseProposal",
              args: [proposal.id, vote ? 0 : 1, 1],
            }
          : {
              functionName: "voteOnCrossChainProposal",
              args: [chainSelectors[proposal.chainId as keyof typeof chainSelectors], proposal.id, vote ? 0 : 1, 1],
            }),
      });

      const { hash } = await writeContract(request);

      await waitForTransaction({ hash });
      await queryClient.invalidateQueries(["proposals"]);

      toast.success("Vote submitted");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong", { id: "vote-error" });
    } finally {
      setIsVoteLoading(false);
    }
  }, [chain, proposal, vote]);

  const options = [
    { value: true, label: "Vote for" },
    { value: false, label: "Vote against" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center flex-col flex-grow pt-10 max-w-5xl m-auto w-full">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="gap-10 flex flex-col mt-6">
      <div className="flex">{proposal?.description}</div>

      <div className="border border-base-200 rounded-xl">
        <div className="p-4 border-b border-base-200">Cast your vote</div>
        <div className="p-4 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            {options.map(({ value, label }) => (
              <button
                key={label}
                className={classNames(
                  "border rounded-full transition-colors border-base-200 hover:border-base-100  text-white px-4 py-2 text-center flex gap-2 justify-center w-full",
                  {
                    ["border-base-100"]: value === vote,
                  },
                )}
                onClick={() => setVote(value)}
              >
                {label}
              </button>
            ))}
          </div>
          {isVoteLoading ? (
            <div className="w-full flex justify-center">
              <Spinner />
            </div>
          ) : (
            <button
              className={classNames(
                "bg-base-200 rounded-full transition-colors text-white px-4 py-2 text-center flex gap-2 justify-center w-full",
                {
                  ["bg-purple-700"]: vote !== undefined,
                },
              )}
              onClick={() => handleVoteTransaction()}
              disabled={vote === undefined}
            >
              Vote
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProposalDetails;
