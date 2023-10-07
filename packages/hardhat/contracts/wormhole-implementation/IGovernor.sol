// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IGovernorV2 {
	struct BaseProposal {
		uint256 id;
		address proposer;
		address[] targets;
		uint256[] values;
		bytes[] calldatas;
		bytes32 descriptionHash;
		bool executed;
		bool votesRequested;
		uint256 startTime;
		uint256 endTime;
		VoteInfo baseChainVoteInfo;
		VoteInfo crossChainVoteInfo;
		uint256 activeProposalId;
	}

	struct CrossChainProposal {
		uint16 chainId;
		uint256 proposalId;
		uint256 startTime;
		uint256 endTime;
		bool isVotesTransferred;
		VoteInfo votesInfo;
		uint256 activeProposalId;
	}

	struct VoteInfo {
		uint256 totalVotes;
		uint256 forVotes;
		uint256 againstVotes;
		uint256 abstrainVotes;
	}

	enum VoteTypes {
		ForVotes,
		AgainstVotes,
		AbstrainVotes
	}

	enum MessageTypes {
		ProposalCreated,
		RequestVotes,
		VotesInfo
	}

	error InvalidProposalId();
	error VotingEnded();
	error SupportedContractCannotBeZeroAddress();
	error ChainNotSupported();
	error OnlyRelayerAllowed();
	error OnlySupportedContracts();
	error VotesAlreadyCountedOn(uint16 chainId, uint256 proposalId);
	error InvalidFeesPaid();
	error VotingPeriodNotEnded();
	error VotesAlreadyRequested();
	error ProposalAlreadyExecuted();
	error VotesNotCountedYet();
	error ProposalRejected();
	error InsufficiantStakedBalance();
	error UnequalListLengths();

	event SupportChainAdded(
		uint16 indexed chainId,
		address indexed contractAddress
	);
	event SupportChainRemoved(uint16 indexed chainId);
	event DurationUpdated(uint256 newDuration);
	event TokenStaked(
		address indexed staker,
		uint256 amount,
		uint256 totalStaked
	);
	event ProposalCreated(
		uint256 indexed proposalId,
		address indexed proposer,
		address[] targets,
		uint256[] values,
		string[] signatures,
		bytes[] calldatas,
		string description,
		uint256 startTime,
		uint256 endTime
	);
	event CrossChainProposalCreated(
		uint16 indexed chainId,
		uint256 indexed proposalId,
		uint256 startTime,
		uint256 endTime
	);
	event VotedOnBaseChainProposal(
		uint256 indexed proposalId,
		address indexed voter,
		uint256 totalForVotes,
		uint256 totalAgainstVotes,
		uint256 totalAbstrainVotes,
		uint256 forVotes,
		uint256 againstVotes,
		uint256 abstrainVotes
	);
	event VotedOnCrossChainProposal(
		uint16 indexed chainId,
		uint256 indexed proposalId,
		address indexed voter,
		uint256 totalForVotes,
		uint256 totalAgainstVotes,
		uint256 totalAbstrainVotes,
		uint256 forVotes,
		uint256 againstVotes,
		uint256 abstrainVotes
	);
	event VotesSent(
		uint16 indexed chainId,
		uint256 indexed proposalId,
		uint256 forVotes,
		uint256 againstVotes,
		uint256 abstrainVotes
	);
	event VotesReceived(
		uint16 indexed chainId,
		uint256 indexed proposalId,
		uint256 totalForVotes,
		uint256 totalAgainstVotes,
		uint256 totalAbstrainVotes,
		uint256 forVotes,
		uint256 againstVotes,
		uint256 abstrainVotes
	);
	event TokenUnstaked(
		address indexed staker,
		uint256 amount,
		uint256 totalStaked
	);
	event ProposalExecuted(
		uint256 indexed proposalId,
		address indexed executer
	);
}
