import { useCallback, useState } from "react";
import Spinner from "./Spinner";
import toast from "react-hot-toast";
import { Abi } from "viem";
import { useNetwork } from "wagmi";
import { prepareWriteContract, waitForTransaction, writeContract } from "wagmi/actions";
import governanceAbi from "~~/abi/governanceAbi.json";
import { governanceContract } from "~~/constants";
import { queryClient } from "~~/services/react-query";

const CreateProposal = () => {
  const { chain } = useNetwork();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [isCreating, setIsCreating] = useState(false);

  const handleCreateProposalTransaction = useCallback(async () => {
    if (!chain?.id) return;

    setIsCreating(true);

    try {
      const { request } = await prepareWriteContract({
        address: governanceContract[chain.id],
        abi: governanceAbi as Abi,
        functionName: "createProposal",
        args: [[], [], [], `${title}:${description}`],
      });

      const { hash } = await writeContract(request);

      await waitForTransaction({ hash });
      await queryClient.invalidateQueries(["proposals"]);

      toast.success("Proposal created");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong", { id: "create-error" });
    } finally {
      setIsCreating(false);
    }
  }, [chain, description, title]);

  return (
    <div className="gap-4 flex flex-col pb-10">
      <div>
        <label className="text-primary-content">Title</label>
        <input
          type="text"
          value={title}
          className="mt-2 rounded-full input input-bordered w-full bg-transparent focus:border-base-100 border-base-200"
          onChange={e => setTitle(e.target.value)}
        />
      </div>

      <div>
        <label className="text-primary-content">Description</label>
        <textarea
          value={description}
          className="mt-2 rounded-2xl input input-bordered w-full py-2 h-40 bg-transparent focus:border-base-100 border-base-200"
          onChange={e => setDescription(e.target.value)}
        />
      </div>

      {isCreating ? (
        <div className="w-full flex justify-center">
          <Spinner />
        </div>
      ) : (
        <button
          className="border rounded-full transition-colors border-base-200 hover:border-base-100  text-white px-4 py-2 text-center flex gap-2 justify-center"
          onClick={() => handleCreateProposalTransaction()}
        >
          Create Proposal
        </button>
      )}
    </div>
  );
};

export default CreateProposal;
