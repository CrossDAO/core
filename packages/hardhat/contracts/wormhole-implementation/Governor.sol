pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./wormhole-solidity-sdk/interfaces/IWormholeRelayer.sol";
import "./wormhole-solidity-sdk/interfaces/IWormholeReceiver.sol";
import "./wormhole-solidity-sdk/Utils.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "./IGovernor.sol";

contract GovernorV2 is IWormholeReceiver, Ownable, IGovernorV2 {
	mapping(uint256 => mapping(address => VoteInfo))
		public hasVotedOnBaseProposal;
	mapping(uint256 => mapping(uint16 => bool)) public votesCountedOn;
	mapping(uint16 => mapping(uint256 => mapping(address => VoteInfo)))
		public hasVotedOnCrossChainProposal;

	mapping(uint256 => BaseProposal) public baseProposals;
	mapping(uint16 => mapping(uint256 => CrossChainProposal))
		public crossChainProposals;

	uint8 public totalSupportedChains;
	uint256 public totalProposals;
	uint256 public duration;

	mapping(uint16 => address) public supportedContracts;
	uint16[] public supportedChains;

	IERC20 public governanceToken;
	mapping(address => uint256) public stakedBalance;

	uint256 constant GAS_LIMIT = 150_000;

	IWormholeRelayer public immutable wormholeRelayer;

	mapping(uint256 => uint256) public estimatedActiveBaseChainProposals;
	mapping(uint16 => mapping(uint256 => uint256))
		public estimatedActiveCrossChainProposals;

	uint256 public totalEstimatedActiveBaseChainProposal;
	mapping(uint16 => uint256) public totalEstimatedActiveCrossChainProposal;

	modifier onlyActiveBaseProposal(uint256 id) {
		BaseProposal memory proposal = baseProposals[id];
		if (proposal.startTime == 0) revert InvalidProposalId();
		if (proposal.endTime < block.timestamp) revert VotingEnded();
		_;
	}

	modifier onlyActiveCrossChainProposal(uint16 chainId, uint256 proposalId) {
		CrossChainProposal memory proposal = crossChainProposals[chainId][
			proposalId
		];
		if (proposal.startTime == 0) revert InvalidProposalId();
		if (proposal.endTime < block.timestamp) revert VotingEnded();
		_;
	}

	constructor(address _governanceToken, address wormholeRelayer_) {
		governanceToken = IERC20(_governanceToken);
		wormholeRelayer = IWormholeRelayer(wormholeRelayer_);
	}

	receive() external payable {}

	function addSupportedContract(
		uint16 chainId,
		address contractAddress
	) public onlyOwner {
		if (contractAddress == address(0))
			revert SupportedContractCannotBeZeroAddress();
		if (supportedContracts[chainId] == address(0)) totalSupportedChains++;
		supportedChains.push(chainId);
		supportedContracts[chainId] = contractAddress;
		emit SupportChainAdded(chainId, contractAddress);
	}

	function removeSupportedContract(uint16 chainId) public onlyOwner {
		if (supportedContracts[chainId] == address(0))
			revert ChainNotSupported();
		supportedContracts[chainId] = address(0);
		for (uint256 i = 0; i < totalSupportedChains; i++) {
			if (supportedChains[i] == chainId) {
				supportedChains[i] = supportedChains[--totalSupportedChains];
				break;
			}
		}
		emit SupportChainRemoved(chainId);
	}

	function setDuration(uint256 _duration) public onlyOwner {
		duration = _duration;
		emit DurationUpdated(_duration);
	}

	function stake(uint256 amount) public {
		governanceToken.transferFrom(msg.sender, address(this), amount);
		stakedBalance[msg.sender] += amount;
		emit TokenStaked(msg.sender, amount, stakedBalance[msg.sender]);
	}

	function createProposal(
		address[] memory targets,
		uint256[] memory values,
		bytes[] memory calldatas,
		string memory description
	) public {
		if (
			targets.length != values.length || values.length != calldatas.length
		) revert UnequalListLengths();
		uint256 id = totalProposals++;
		uint256 startTime = block.timestamp;
		uint256 endTime = block.timestamp + duration;
		baseProposals[id] = BaseProposal({
			id: id,
			proposer: msg.sender,
			targets: targets,
			values: values,
			calldatas: calldatas,
			descriptionHash: keccak256(bytes(description)),
			executed: false,
			votesRequested: false,
			startTime: startTime,
			endTime: endTime,
			baseChainVoteInfo: VoteInfo({
				totalVotes: 0,
				forVotes: 0,
				againstVotes: 0,
				abstrainVotes: 0
			}),
			crossChainVoteInfo: VoteInfo({
				totalVotes: 0,
				forVotes: 0,
				againstVotes: 0,
				abstrainVotes: 0
			}),
			activeProposalId: totalEstimatedActiveBaseChainProposal
		});

		// send the message to the voting chain
		bytes memory message = abi.encode(id, startTime, endTime);
		broadcastMessageToOtherChains(MessageTypes.ProposalCreated, message, 0);

		estimatedActiveBaseChainProposals[
			totalEstimatedActiveBaseChainProposal++
		] = id;

		emit ProposalCreated(
			id,
			msg.sender,
			targets,
			values,
			new string[](targets.length),
			calldatas,
			description,
			startTime,
			endTime
		);
	}

	function voteOnBaseProposal(
		uint256 id,
		VoteTypes voteType
	) public onlyActiveBaseProposal(id) {
		BaseProposal storage proposal = baseProposals[id];
		VoteInfo storage votes = hasVotedOnBaseProposal[id][msg.sender];
		proposal.baseChainVoteInfo.forVotes -= votes.forVotes;
		proposal.baseChainVoteInfo.againstVotes -= votes.againstVotes;
		proposal.baseChainVoteInfo.abstrainVotes -= votes.abstrainVotes;
		uint256 votingPower = stakedBalance[msg.sender];
		proposal.baseChainVoteInfo.totalVotes =
			proposal.baseChainVoteInfo.totalVotes +
			votingPower -
			votes.totalVotes;
		votes.totalVotes = votingPower;
		if (voteType == VoteTypes.ForVotes) {
			votes.forVotes = votingPower;
			votes.againstVotes = 0;
			votes.abstrainVotes = 0;
			proposal.baseChainVoteInfo.forVotes += votingPower;
		} else if (voteType == VoteTypes.AgainstVotes) {
			votes.forVotes = 0;
			votes.againstVotes = votingPower;
			votes.abstrainVotes = 0;
			proposal.baseChainVoteInfo.againstVotes += votingPower;
		} else if (voteType == VoteTypes.AbstrainVotes) {
			votes.forVotes = 0;
			votes.againstVotes = 0;
			votes.abstrainVotes = votingPower;
			proposal.baseChainVoteInfo.abstrainVotes += votingPower;
		}
		emit VotedOnBaseChainProposal(
			id,
			msg.sender,
			proposal.baseChainVoteInfo.forVotes,
			proposal.baseChainVoteInfo.againstVotes,
			proposal.baseChainVoteInfo.abstrainVotes,
			votes.forVotes,
			votes.againstVotes,
			votes.abstrainVotes
		);
	}

	function voteOnCrossChainProposal(
		uint16 chainId,
		uint256 proposalId,
		VoteTypes voteType
	) public onlyActiveCrossChainProposal(chainId, proposalId) {
		CrossChainProposal storage proposal = crossChainProposals[chainId][
			proposalId
		];
		VoteInfo storage votes = hasVotedOnCrossChainProposal[chainId][
			proposalId
		][msg.sender];
		uint256 votingPower = stakedBalance[msg.sender];
		proposal.votesInfo.forVotes -= votes.forVotes;
		proposal.votesInfo.againstVotes -= votes.againstVotes;
		proposal.votesInfo.abstrainVotes -= votes.abstrainVotes;
		proposal.votesInfo.totalVotes =
			proposal.votesInfo.totalVotes +
			votingPower -
			votes.totalVotes;
		votes.totalVotes = votingPower;
		if (voteType == VoteTypes.ForVotes) {
			votes.forVotes = votingPower;
			votes.againstVotes = 0;
			votes.abstrainVotes = 0;
			proposal.votesInfo.forVotes += votingPower;
		} else if (voteType == VoteTypes.AgainstVotes) {
			votes.forVotes = 0;
			votes.againstVotes = votingPower;
			votes.abstrainVotes = 0;
			proposal.votesInfo.againstVotes += votingPower;
		} else if (voteType == VoteTypes.AbstrainVotes) {
			votes.forVotes = 0;
			votes.againstVotes = 0;
			votes.abstrainVotes = votingPower;
			proposal.votesInfo.abstrainVotes += votingPower;
		}
	}

	function countVotes(uint256 id) public {
		if (id >= totalProposals) revert InvalidProposalId();
		BaseProposal memory proposal = baseProposals[id];
		if (proposal.endTime > block.timestamp) revert VotingPeriodNotEnded();
		if (proposal.votesRequested) revert VotesAlreadyRequested();

		baseProposals[id].votesRequested = true;

		// send the message to the voting chain
		bytes memory message = abi.encode(id);
		broadcastMessageToOtherChains(MessageTypes.RequestVotes, message, 0);

		estimatedActiveBaseChainProposals[
			proposal.activeProposalId
		] = estimatedActiveBaseChainProposals[
			--totalEstimatedActiveBaseChainProposal
		];

		// emit VotesRequested(id, msg.sender);
	}

	function broadcastMessageToOtherChains(
		MessageTypes messageType,
		bytes memory message,
		uint256 value
	) internal {
		// TODO: check if the voting period is over, and also if not broadcasted earlier
		uint256 m_totalSupportedVotingChains = totalSupportedChains;

		for (uint256 i = 0; i < m_totalSupportedVotingChains; i++) {
			uint16 chainId = supportedChains[i];
			address votingContractAddress = supportedContracts[chainId];
			uint256 cost = getChainCost(chainId);
			wormholeRelayer.sendPayloadToEvm{ value: cost }(
				chainId,
				votingContractAddress,
				abi.encode(messageType, message), // payload
				value, // no receiver value needed since we're just passing a message
				GAS_LIMIT
			);
		}
	}

	function quoteBroadcastingFees() public view returns (uint256 cost) {
		uint256 m_totalSupportedVotingChains = totalSupportedChains;
		for (uint256 i = 0; i < m_totalSupportedVotingChains; i++) {
			uint16 targetChainId = supportedChains[i];
			cost += getChainCost(targetChainId);
		}
	}

	function getChainCost(uint16 chainId) internal view returns (uint256 cost) {
		(cost, ) = wormholeRelayer.quoteEVMDeliveryPrice(chainId, 0, GAS_LIMIT);
	}

	function executeProposal(uint256 id) external {
		BaseProposal memory proposal = baseProposals[id];
		if (proposal.executed) revert ProposalAlreadyExecuted();
		uint256 m_totalSupportedVotingChains = totalSupportedChains;
		for (uint256 i = 0; i < m_totalSupportedVotingChains; i++) {
			uint16 chainId = supportedChains[i];
			if (!votesCountedOn[id][chainId]) revert VotesNotCountedYet();
		}
		uint256 forVotes = proposal.baseChainVoteInfo.forVotes +
			proposal.crossChainVoteInfo.forVotes;
		uint256 againstVotes = proposal.baseChainVoteInfo.againstVotes +
			proposal.crossChainVoteInfo.againstVotes;
		uint256 abstrainVotes = proposal.baseChainVoteInfo.abstrainVotes +
			proposal.crossChainVoteInfo.abstrainVotes;

		// TODO: check quorum condition

		if (forVotes < againstVotes) revert ProposalRejected();

		baseProposals[id].executed = true;

		for (uint256 i = 0; i < proposal.targets.length; i++) {
			(bool success, bytes memory returndata) = proposal.targets[i].call{
				value: proposal.values[i]
			}(proposal.calldatas[i]);
			Address.verifyCallResult(
				success,
				returndata,
				"Governer: call reverted without message"
			);
		}
		emit ProposalExecuted(id, msg.sender);
	}

	// create a receive message function with all the functions
	function receiveWormholeMessages(
		bytes memory payload,
		bytes[] memory /* additionalVaas */,
		bytes32 sourceAddress,
		uint16 sourceChain,
		bytes32 /* deliveryHash */
	) external payable override {
		if (msg.sender != address(wormholeRelayer)) revert OnlyRelayerAllowed();

		address senderContractAddress = fromWormholeFormat(sourceAddress);
		if (supportedContracts[sourceChain] != senderContractAddress)
			revert OnlySupportedContracts();

		(MessageTypes messageType, bytes memory message) = abi.decode(
			payload,
			(MessageTypes, bytes)
		);
		if (messageType == MessageTypes.ProposalCreated) {
			(uint256 proposalId, uint256 startTime, uint256 endTime) = abi
				.decode(message, (uint256, uint256, uint256));
			_createCrossChainProposal(
				sourceChain,
				proposalId,
				startTime,
				endTime
			);
		} else if (messageType == MessageTypes.RequestVotes) {
			uint256 proposalId = abi.decode(message, (uint256));
			_sendVotes(sourceChain, proposalId);
		} else if (messageType == MessageTypes.VotesInfo) {
			(
				uint256 proposalId,
				uint256 forVotes,
				uint256 againstVotes,
				uint256 abstrainVotes
			) = abi.decode(message, (uint256, uint256, uint256, uint256));
			_receiveVotes(
				sourceChain,
				proposalId,
				forVotes,
				againstVotes,
				abstrainVotes
			);
		}
	}

	function _createCrossChainProposal(
		uint16 chainId,
		uint256 proposalId,
		uint256 startTime,
		uint256 endTime
	) internal {
		crossChainProposals[chainId][proposalId] = CrossChainProposal({
			chainId: chainId,
			proposalId: proposalId,
			startTime: startTime,
			endTime: endTime,
			isVotesTransferred: false,
			votesInfo: VoteInfo({
				totalVotes: 0,
				forVotes: 0,
				againstVotes: 0,
				abstrainVotes: 0
			}),
			activeProposalId: totalEstimatedActiveCrossChainProposal[chainId]
		});

		estimatedActiveCrossChainProposals[chainId][
			totalEstimatedActiveCrossChainProposal[chainId]++
		] = proposalId;

		emit CrossChainProposalCreated(chainId, proposalId, startTime, endTime);
	}

	function _sendVotes(uint16 chainId, uint256 proposalId) internal {
		VoteInfo memory votes = crossChainProposals[chainId][proposalId]
			.votesInfo;
		crossChainProposals[chainId][proposalId].isVotesTransferred = true;
		bytes memory message = abi.encode(
			proposalId,
			votes.forVotes,
			votes.againstVotes,
			votes.abstrainVotes
		);

		// TODO: send only  to base
		address votingContractAddress = supportedContracts[chainId];
		uint256 cost = getChainCost(chainId);

		wormholeRelayer.sendPayloadToEvm{ value: cost }(
			chainId,
			votingContractAddress,
			abi.encode(MessageTypes.VotesInfo, message), // payload
			0, // no receiver value needed since we're just passing a message
			GAS_LIMIT
		);

		estimatedActiveCrossChainProposals[chainId][
			crossChainProposals[chainId][proposalId].activeProposalId
		] = estimatedActiveCrossChainProposals[chainId][
			--totalEstimatedActiveCrossChainProposal[chainId]
		];

		emit VotesSent(
			chainId,
			proposalId,
			votes.forVotes,
			votes.againstVotes,
			votes.abstrainVotes
		);
	}

	function _receiveVotes(
		uint16 chainId,
		uint256 proposalId,
		uint256 forVotes,
		uint256 againstVotes,
		uint256 abstrainVotes
	) internal {
		if (votesCountedOn[proposalId][chainId])
			revert VotesAlreadyCountedOn(chainId, proposalId);
		votesCountedOn[proposalId][chainId] = true;
		baseProposals[proposalId].crossChainVoteInfo.forVotes += forVotes;
		baseProposals[proposalId]
			.crossChainVoteInfo
			.againstVotes += againstVotes;
		baseProposals[proposalId]
			.crossChainVoteInfo
			.abstrainVotes += abstrainVotes;
		baseProposals[proposalId].crossChainVoteInfo.totalVotes =
			forVotes +
			againstVotes +
			abstrainVotes;

		emit VotesReceived(
			chainId,
			proposalId,
			baseProposals[proposalId].crossChainVoteInfo.forVotes,
			baseProposals[proposalId].crossChainVoteInfo.againstVotes,
			baseProposals[proposalId].crossChainVoteInfo.abstrainVotes,
			forVotes,
			againstVotes,
			abstrainVotes
		);
	}

	function unstake(uint256 amount) external {
		if (stakedBalance[msg.sender] < amount)
			revert InsufficiantStakedBalance();

		uint256 newVotingPower = stakedBalance[msg.sender] - amount;
		stakedBalance[msg.sender] = newVotingPower;

		// check the base proposals
		for (uint256 j = 0; j < totalEstimatedActiveBaseChainProposal; j++) {
			uint256 proposalId = estimatedActiveBaseChainProposals[j];
			BaseProposal memory proposal = baseProposals[proposalId];
			if (
				proposal.endTime <= block.timestamp &&
				hasVotedOnBaseProposal[proposalId][msg.sender].totalVotes == 0
			) continue;
			VoteInfo memory votes = hasVotedOnBaseProposal[proposalId][
				msg.sender
			];
			BaseProposal storage s_proposal = baseProposals[proposalId];
			uint256 newTotalVotes = _min(votes.totalVotes, newVotingPower);
			uint256 newForVotes = _min(votes.forVotes, newVotingPower);
			uint256 newAgainstVotes = _min(votes.againstVotes, newVotingPower);
			uint256 newAbstrainVotes = _min(
				votes.abstrainVotes,
				newVotingPower
			);

			s_proposal.baseChainVoteInfo.totalVotes +=
				votes.totalVotes -
				newTotalVotes;
			s_proposal.baseChainVoteInfo.forVotes +=
				votes.forVotes -
				newForVotes;
			s_proposal.baseChainVoteInfo.againstVotes +=
				votes.againstVotes -
				newAgainstVotes;
			s_proposal.baseChainVoteInfo.abstrainVotes +=
				votes.abstrainVotes -
				newAbstrainVotes;

			VoteInfo storage s_votes = hasVotedOnBaseProposal[proposalId][
				msg.sender
			];

			s_votes.totalVotes = newTotalVotes;
			s_votes.forVotes = newForVotes;
			s_votes.againstVotes = newAgainstVotes;
			s_votes.abstrainVotes = newAbstrainVotes;

			emit VotedOnBaseChainProposal(
				proposalId,
				msg.sender,
				s_proposal.baseChainVoteInfo.forVotes,
				s_proposal.baseChainVoteInfo.againstVotes,
				s_proposal.baseChainVoteInfo.abstrainVotes,
				newForVotes,
				newAgainstVotes,
				newAbstrainVotes
			);
		}

		// check the cross chain proposals
		uint256 m_totalSupportedVotingChains = totalSupportedChains;
		for (uint256 i = 0; i < m_totalSupportedVotingChains; i++) {
			uint16 chainId = supportedChains[i];
			for (
				uint256 j = 0;
				j < totalEstimatedActiveCrossChainProposal[chainId];
				j++
			) {
				uint256 proposalId = estimatedActiveCrossChainProposals[
					chainId
				][j];
				CrossChainProposal memory proposal = crossChainProposals[
					chainId
				][proposalId];
				if (
					proposal.endTime <= block.timestamp &&
					hasVotedOnCrossChainProposal[chainId][proposalId][
						msg.sender
					].totalVotes ==
					0
				) continue;
				VoteInfo memory votes = hasVotedOnCrossChainProposal[chainId][
					proposalId
				][msg.sender];
				CrossChainProposal storage s_proposal = crossChainProposals[
					chainId
				][proposalId];

				uint256 newTotalVotes = _min(votes.totalVotes, newVotingPower);
				uint256 newForVotes = _min(votes.forVotes, newVotingPower);
				uint256 newAgainstVotes = _min(
					votes.againstVotes,
					newVotingPower
				);
				uint256 newAbstrainVotes = _min(
					votes.abstrainVotes,
					newVotingPower
				);

				s_proposal.votesInfo.totalVotes +=
					votes.totalVotes -
					newTotalVotes;
				s_proposal.votesInfo.forVotes += votes.forVotes - newForVotes;
				s_proposal.votesInfo.againstVotes +=
					votes.againstVotes -
					newAgainstVotes;
				s_proposal.votesInfo.abstrainVotes +=
					votes.abstrainVotes -
					newAbstrainVotes;

				VoteInfo storage s_votes = hasVotedOnCrossChainProposal[
					chainId
				][proposalId][msg.sender];

				s_votes.totalVotes = newTotalVotes;
				s_votes.forVotes = newForVotes;
				s_votes.againstVotes = newAgainstVotes;
				s_votes.abstrainVotes = newAbstrainVotes;
				emit VotedOnCrossChainProposal(
					chainId,
					proposalId,
					msg.sender,
					s_proposal.votesInfo.forVotes,
					s_proposal.votesInfo.againstVotes,
					s_proposal.votesInfo.abstrainVotes,
					newForVotes,
					newAgainstVotes,
					newAbstrainVotes
				);
			}
		}
		governanceToken.transfer(msg.sender, amount);
		emit TokenUnstaked(msg.sender, amount, newVotingPower);
	}

	function _min(uint256 a, uint256 b) internal pure returns (uint256) {
		if (a > b) return b;
		return a;
	}
}
