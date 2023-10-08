import { syncGovernorContractEvent } from "./governorContract";
import { syncTokenContractEvent } from "./tokenContract";
import { Provider } from "ethers";

export async function syncEvents({
  id: chainId,
  minBlock,
  address: governorAddress,
  token: tokenAddress,
  provider,
}: {
  id: number;
  token: string;
  address: string;
  provider: Provider;
  minBlock: number;
}) {
  await syncGovernorContractEvent(chainId, minBlock, governorAddress, provider);
  await syncTokenContractEvent(chainId, minBlock, tokenAddress, provider);
}
