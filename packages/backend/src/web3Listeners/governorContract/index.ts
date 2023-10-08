import { EventHandler } from "../../EventIndexer";
import GovernorABI from "../../abi/Governor.json";
import { Contract, Provider } from "ethers";

export async function syncGovernorContractEvent(
  chainId: number,
  minBlock: number,
  address: string,
  provider: Provider
) {
  const contract = new Contract(address, GovernorABI, provider);

  const SupportChainAddedEventHandler = new EventHandler(
    provider,
    minBlock,
    chainId,
    contract,
    [
      ["chainId", "chainId", "int"],
      ["contractAddress", "contractAddress", "string"],
    ],
    "supportChainAddedEvent",
    "SupportChainAdded"
  );
  const SupportChainRemovedEventHandler = new EventHandler(
    provider,
    minBlock,
    chainId,
    contract,
    [["chainId", "chainId", "int"]],
    "supportChainRemovedEvent",
    "SupportChainRemoved"
  );
  const DurationUpdatedEventHandler = new EventHandler(
    provider,
    minBlock,
    chainId,
    contract,
    [["newDuration", "newDuration", "string"]],
    "durationUpdatedEvent",
    "DurationUpdated"
  );
  const TokenStakedEventHandler = new EventHandler(
    provider,
    minBlock,
    chainId,
    contract,
    [
      ["staker", "staker", "string"],
      ["amount", "amount", "string"],
      ["totalStaked", "totalStaked", "string"],
    ],
    "tokenStakedEvent",
    "TokenStaked"
  );
  const ProposalCreatedEventHandler = new EventHandler(
    provider,
    minBlock,
    chainId,
    contract,
    [
      ["proposalId", "proposalId", "string"],
      ["proposer", "proposer", "string"],
      ["targets", "targets", "string[]"],
      ["values", "values", "string[]"],
      ["signatures", "signatures", "string[]"],
      ["calldatas", "calldatas", "string[]"],
      ["description", "description", "string"],
      ["startTime", "startTime", "string"],
      ["endTime", "endTime", "string"],
    ],
    "proposalCreatedEvent",
    "ProposalCreated"
  );
  const CrossChainProposalCreatedEventHandler = new EventHandler(
    provider,
    minBlock,
    chainId,
    contract,
    [
      ["chainId", "chainId", "int"],
      ["proposalId", "proposalId", "string"],
      ["startTime", "startTime", "string"],
      ["endTime", "endTime", "string"],
    ],
    "crossChainProposalCreatedEvent",
    "CrossChainProposalCreated"
  );
  const VotedOnBaseChainProposalEventHandler = new EventHandler(
    provider,
    minBlock,
    chainId,
    contract,
    [
      ["proposalId", "proposalId", "string"],
      ["voter", "voter", "string"],
      ["totalForVotes", "totalForVotes", "string"],
      ["totalAgainstVotes", "totalAgainstVotes", "string"],
      ["totalAbstrainVotes", "totalAbstrainVotes", "string"],
      ["forVotes", "forVotes", "string"],
      ["againstVotes", "againstVotes", "string"],
      ["abstrainVotes", "abstrainVotes", "string"],
    ],
    "votedOnBaseChainProposalEvent",
    "VotedOnBaseChainProposal"
  );
  const VotedOnCrossChainProposalEventHandler = new EventHandler(
    provider,
    minBlock,
    chainId,
    contract,
    [
      ["chainId", "chainId", "int"],
      ["proposalId", "proposalId", "string"],
      ["voter", "voter", "string"],
      ["totalForVotes", "totalForVotes", "string"],
      ["totalAgainstVotes", "totalAgainstVotes", "string"],
      ["totalAbstrainVotes", "totalAbstrainVotes", "string"],
      ["forVotes", "forVotes", "string"],
      ["againstVotes", "againstVotes", "string"],
      ["abstrainVotes", "abstrainVotes", "string"],
    ],
    "votedOnCrossChainProposalEvent",
    "VotedOnCrossChainProposal"
  );
  const VotesSentEventHandler = new EventHandler(
    provider,
    minBlock,
    chainId,
    contract,
    [
      ["chainId", "chainId", "int"],
      ["proposalId", "proposalId", "string"],
      ["forVotes", "forVotes", "string"],
      ["againstVotes", "againstVotes", "string"],
      ["abstrainVotes", "abstrainVotes", "string"],
    ],
    "votesSentEvent",
    "VotesSent"
  );
  const VotesReceivedEventHandler = new EventHandler(
    provider,
    minBlock,
    chainId,
    contract,
    [
      ["chainId", "chainId", "int"],
      ["proposalId", "proposalId", "string"],
      ["totalForVotes", "totalForVotes", "string"],
      ["totalAgainstVotes", "totalAgainstVotes", "string"],
      ["totalAbstrainVotes", "totalAbstrainVotes", "string"],
      ["forVotes", "forVotes", "string"],
      ["againstVotes", "againstVotes", "string"],
      ["abstrainVotes", "abstrainVotes", "string"],
    ],
    "votesReceivedEvent",
    "VotesReceived"
  );
  const TokenUnstakedEventHandler = new EventHandler(
    provider,
    minBlock,
    chainId,
    contract,
    [
      ["staker", "staker", "string"],
      ["amount", "amount", "string"],
      ["totalStaked", "totalStaked", "string"],
    ],
    "tokenUnstakedEvent",
    "TokenUnstaked"
  );
  const ProposalExecutedEventHandler = new EventHandler(
    provider,
    minBlock,
    chainId,
    contract,
    [
      ["proposalId", "proposalId", "string"],
      ["executer", "executer", "string"],
    ],
    "proposalExecutedEvent",
    "ProposalExecuted"
  );

  await Promise.all([
    SupportChainAddedEventHandler.syncEvent(),
    SupportChainRemovedEventHandler.syncEvent(),
    DurationUpdatedEventHandler.syncEvent(),
    TokenStakedEventHandler.syncEvent(),
    ProposalCreatedEventHandler.syncEvent(),
    CrossChainProposalCreatedEventHandler.syncEvent(),
    VotedOnBaseChainProposalEventHandler.syncEvent(),
    VotedOnCrossChainProposalEventHandler.syncEvent(),
    VotesSentEventHandler.syncEvent(),
    VotesReceivedEventHandler.syncEvent(),
    TokenUnstakedEventHandler.syncEvent(),
    ProposalExecutedEventHandler.syncEvent(),
  ]);
}
