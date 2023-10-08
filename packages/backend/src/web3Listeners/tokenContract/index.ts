import { EventHandler } from "../../EventIndexer";
import TokenABI from "../../abi/Token.json";
import { Contract, Provider } from "ethers";

export async function syncTokenContractEvent(
  chainId: number,
  minBlock: number,
  address: string,
  provider: Provider
) {
  const contract = new Contract(address, TokenABI, provider);

  const TransferEventHandler = new EventHandler(
    provider,
    minBlock,
    chainId,
    contract,
    [
      ["from", "from", "string"],
      ["to", "to", "string"],
      ["value", "value", "string"],
    ],
    "transferEvent",
    "Transfer"
  );

  const ApprovalEventHandler = new EventHandler(
    provider,
    minBlock,
    chainId,
    contract,
    [
      ["owner", "owner", "string"],
      ["spender", "spender", "string"],
      ["value", "value", "string"],
    ],
    "approvalEvent",
    "Approval"
  );

  await Promise.all([
    ApprovalEventHandler.syncEvent(),
    TransferEventHandler.syncEvent(),
  ]);
}
