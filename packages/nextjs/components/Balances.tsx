import { useCallback, useState } from "react";
import Spinner from "./Spinner";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { Abi } from "viem";
import { useAccount, useContractRead, useNetwork } from "wagmi";
import { prepareWriteContract, waitForTransaction, writeContract } from "wagmi/actions";
import governanceAbi from "~~/abi/governanceAbi.json";
import tokenAbi from "~~/abi/tokenAbi.json";
import { governanceContract, tokenContract } from "~~/constants";
import useHydrated from "~~/hooks/useHydrated";

const Balances = () => {
  const { chain } = useNetwork();

  const { address } = useAccount();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState("");

  const { hasHydrated } = useHydrated();

  const { data: result, refetch } = useContractRead({
    address: governanceContract[chain?.id || 0],
    abi: governanceAbi as Abi,
    functionName: "stakedBalance",
    args: [address],
  });

  const handleStakeTransaction = useCallback(async () => {
    if (!chain?.id) return;

    setIsLoading(true);

    try {
      const { request: approveRequest } = await prepareWriteContract({
        address: tokenContract[chain.id],
        abi: tokenAbi,
        functionName: "approve",
        args: [governanceContract[chain.id], ethers.parseEther(amount)],
      });

      const { hash: approveHash } = await writeContract(approveRequest);

      await waitForTransaction({ hash: approveHash });

      const { request } = await prepareWriteContract({
        address: governanceContract[chain.id],
        abi: governanceAbi as Abi,
        functionName: "stake",
        args: [ethers.parseEther(amount)],
      });

      const { hash } = await writeContract(request);

      await waitForTransaction({ hash });

      toast.success("Staked tokens successfully");

      refetch();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong", { id: "stake-error" });
    } finally {
      setIsLoading(false);
    }
  }, [amount, chain, refetch]);

  return (
    <>
      <div className="gap-4 flex flex-col max-w-2xl w-full m-auto border border-base-200 p-4 rounded-2xl">
        <h1>
          <span className="text-2xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-400">
            Balances
          </span>
        </h1>
        <div className="flex flex-col gap-4">
          {hasHydrated && (
            <>
              <div className="flex-1">
                <div className="w-full text-lg border-b border-base-200 flex justify-between pb-1">
                  <div>Public</div>
                  <button
                    className="text-sm py-1 px-2 border border-base-200 rounded-full"
                    onClick={() => setIsModalOpen(true)}
                  >
                    Stake
                  </button>
                </div>

                <div className="w-full flex flex-col gap-1 text-sm mt-2">
                  {/* <div className="flex justify-between">
              <div className="text-primary-content">Unstaked</div>
              <div>30.0</div>
            </div> */}

                  <div className="flex justify-between">
                    <div className="text-primary-content">Staked</div>
                    <div>{result?.toString()}</div>
                  </div>
                </div>
              </div>

              <div className="flex-1 mt-5">
                <div className="w-full text-lg border-b border-base-200">Private</div>

                <div className="w-full flex flex-col gap-1 text-sm mt-2">
                  {/* <div className="flex justify-between">
              <div className="text-primary-content">Unstaked</div>
              <div>20.0</div>
            </div> */}

                  <div className="flex justify-between">
                    <div className="text-primary-content">Staked</div>
                    <div>0</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className={`modal ${isModalOpen ? "modal-open" : ""}`}>
        <div className="modal-box w-full max-w-xl flex items-center flex-col bg-base-300 text-white shadow-md">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={() => setIsModalOpen(false)}
          >
            ✕
          </button>

          <div className="flex gap-4 flex-col w-1/2 mt-10">
            <div>
              <label className="text-primary-content">Amount</label>
              <input
                type="text"
                value={amount}
                className="mt-2 rounded-full input input-bordered w-full bg-transparent focus:border-base-100 border-base-200"
                onChange={e => setAmount(e.target.value)}
              />
            </div>
            <div className="flex gap-3 mt-5">
              {isLoading ? (
                <div className="w-full flex justify-center">
                  <Spinner />
                </div>
              ) : (
                <button
                  className={
                    "bg-purple-700 rounded-full transition-colors text-white px-4 py-2 text-center flex gap-2 justify-center w-full"
                  }
                  onClick={() => handleStakeTransaction()}
                >
                  Stake
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Balances;
