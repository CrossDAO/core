// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";

import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {OwnerIsCreator} from "@chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol";
import {CCIPReceiver} from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";

import "../IGovernor.sol";

contract MockGovernor is OwnerIsCreator, CCIPReceiver, IGovernor {
    mapping(uint256 => mapping(address => VoteInfo))
        public hasVotedOnBaseProposal;
    mapping(uint256 => mapping(uint64 => bool)) public votesCountedOn;
    mapping(uint64 => mapping(uint256 => mapping(address => VoteInfo)))
        public hasVotedOnCrossChainProposal;

    mapping(uint256 => BaseProposal) public baseProposals;
    mapping(uint64 => mapping(uint256 => CrossChainProposal))
        public crossChainProposals;

    uint8 public totalSupportedChains;
    uint256 public totalProposals;
    uint256 public duration;

    mapping(uint64 => address) public supportedContracts;
    uint64[] public supportedChains;

    uint256 constant GAS_LIMIT = 150_000;

    IRouterClient router;

    LinkTokenInterface linkToken;

    mapping(uint256 => uint256) public estimatedActiveBaseChainProposals;
    mapping(uint64 => mapping(uint256 => uint256))
        public estimatedActiveCrossChainProposals;

    uint256 public totalEstimatedActiveBaseChainProposal;
    mapping(uint64 => uint256) public totalEstimatedActiveCrossChainProposal;

    modifier onlyActiveBaseProposal(uint256 id) {
        BaseProposal memory proposal = baseProposals[id];
        if (proposal.startTime == 0) revert InvalidProposalId();
        if (proposal.endTime < block.timestamp) revert VotingEnded();
        _;
    }

    modifier onlyActiveCrossChainProposal(
        uint64 chainSelector,
        uint256 proposalId
    ) {
        CrossChainProposal memory proposal = crossChainProposals[chainSelector][
            proposalId
        ];
        if (proposal.startTime == 0) revert InvalidProposalId();
        if (proposal.endTime < block.timestamp) revert VotingEnded();
        _;
    }

    constructor(
        IRouterClient _router,
        LinkTokenInterface _linkToken
    ) CCIPReceiver(address(_router)) {
        linkToken = _linkToken;
        router = _router;
    }

    receive() external payable {}

    function addSupportedContract(
        uint64 chainSelector,
        address contractAddress
    ) public onlyOwner {
        if (contractAddress == address(0))
            revert SupportedContractCannotBeZeroAddress();
        if (supportedContracts[chainSelector] == address(0))
            totalSupportedChains++;
        supportedChains.push(chainSelector);
        supportedContracts[chainSelector] = contractAddress;
        emit SupportChainAdded(chainSelector, contractAddress);
    }

    function removeSupportedContract(uint64 chainSelector) public onlyOwner {
        if (supportedContracts[chainSelector] == address(0))
            revert ChainNotSupported();
        supportedContracts[chainSelector] = address(0);
        for (uint256 i = 0; i < totalSupportedChains; i++) {
            if (supportedChains[i] == chainSelector) {
                supportedChains[i] = supportedChains[--totalSupportedChains];
                delete supportedChains[--totalSupportedChains];
                break;
            }
        }
        emit SupportChainRemoved(chainSelector);
    }

    function setDuration(uint256 _duration) public onlyOwner {
        duration = _duration;
        emit DurationUpdated(_duration);
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
            description: description,
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

        bytes memory message = abi.encode(id, startTime, endTime);
        broadcastMessageToOtherChains(MessageTypes.ProposalCreated, message);

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
        VoteTypes voteType,
        uint256 votingPower
    ) public onlyActiveBaseProposal(id) {
        BaseProposal storage proposal = baseProposals[id];
        VoteInfo storage votes = hasVotedOnBaseProposal[id][msg.sender];
        proposal.baseChainVoteInfo.forVotes -= votes.forVotes;
        proposal.baseChainVoteInfo.againstVotes -= votes.againstVotes;
        proposal.baseChainVoteInfo.abstrainVotes -= votes.abstrainVotes;
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
        uint64 chainSelector,
        uint256 proposalId,
        VoteTypes voteType,
        uint256 votingPower
    ) public onlyActiveCrossChainProposal(chainSelector, proposalId) {
        CrossChainProposal storage proposal = crossChainProposals[
            chainSelector
        ][proposalId];
        VoteInfo storage votes = hasVotedOnCrossChainProposal[chainSelector][
            proposalId
        ][msg.sender];
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
        broadcastMessageToOtherChains(MessageTypes.RequestVotes, message);

        estimatedActiveBaseChainProposals[
            proposal.activeProposalId
        ] = estimatedActiveBaseChainProposals[
            --totalEstimatedActiveBaseChainProposal
        ];
    }

    function broadcastMessageToOtherChains(
        MessageTypes messageType,
        bytes memory message
    ) internal {
        uint256 m_totalSupportedVotingChains = totalSupportedChains;

        for (uint256 i = 0; i < m_totalSupportedVotingChains; i++) {
            uint64 destinationChainSelector = supportedChains[i];
            address votingContractAddress = supportedContracts[
                destinationChainSelector
            ];
            _sendMessage(
                destinationChainSelector,
                votingContractAddress,
                abi.encode(messageType, message)
            );
        }
    }

    function _sendMessage(
        uint64 destinationChainSelector,
        address receiver,
        bytes memory data
    ) internal returns (bytes32 messageId) {
        Client.EVM2AnyMessage memory evm2AnyMessage = Client.EVM2AnyMessage({
            receiver: abi.encode(receiver),
            data: data,
            tokenAmounts: new Client.EVMTokenAmount[](0),
            extraArgs: Client._argsToBytes(
                Client.EVMExtraArgsV1({gasLimit: 400_000, strict: false})
            ),
            feeToken: address(linkToken)
        });

        uint256 fees = router.getFee(destinationChainSelector, evm2AnyMessage);

        if (fees > linkToken.balanceOf(address(this)))
            revert NotEnoughBalance(linkToken.balanceOf(address(this)), fees);

        linkToken.approve(address(router), fees);

        messageId = router.ccipSend(destinationChainSelector, evm2AnyMessage);

        return messageId;
    }

    function executeProposal(uint256 id) external {
        BaseProposal memory proposal = baseProposals[id];
        if (proposal.executed) revert ProposalAlreadyExecuted();
        uint256 m_totalSupportedVotingChains = totalSupportedChains;
        for (uint256 i = 0; i < m_totalSupportedVotingChains; i++) {
            uint64 chainSelector = supportedChains[i];
            if (!votesCountedOn[id][chainSelector]) revert VotesNotCountedYet();
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

    function _ccipReceive(
        Client.Any2EVMMessage memory any2EvmMessage
    ) internal override {
        address sender = abi.decode(any2EvmMessage.sender, (address));
        if (supportedContracts[any2EvmMessage.sourceChainSelector] != sender)
            revert OnlySupportedContracts();

        (MessageTypes messageType, bytes memory message) = abi.decode(
            any2EvmMessage.data,
            (MessageTypes, bytes)
        );

        if (messageType == MessageTypes.ProposalCreated) {
            (uint256 proposalId, uint256 startTime, uint256 endTime) = abi
                .decode(message, (uint256, uint256, uint256));
            _createCrossChainProposal(
                any2EvmMessage.sourceChainSelector,
                proposalId,
                startTime,
                endTime
            );
        } else if (messageType == MessageTypes.RequestVotes) {
            uint256 proposalId = abi.decode(message, (uint256));
            _sendVotes(any2EvmMessage.sourceChainSelector, proposalId);
        } else if (messageType == MessageTypes.VotesInfo) {
            (
                uint256 proposalId,
                uint256 forVotes,
                uint256 againstVotes,
                uint256 abstrainVotes
            ) = abi.decode(message, (uint256, uint256, uint256, uint256));
            _receiveVotes(
                any2EvmMessage.sourceChainSelector,
                proposalId,
                forVotes,
                againstVotes,
                abstrainVotes
            );
        }
    }

    function _createCrossChainProposal(
        uint64 chainSelector,
        uint256 proposalId,
        uint256 startTime,
        uint256 endTime
    ) internal {
        crossChainProposals[chainSelector][proposalId] = CrossChainProposal({
            chainSelector: chainSelector,
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
            activeProposalId: totalEstimatedActiveCrossChainProposal[
                chainSelector
            ]
        });

        estimatedActiveCrossChainProposals[chainSelector][
            totalEstimatedActiveCrossChainProposal[chainSelector]++
        ] = proposalId;

        emit CrossChainProposalCreated(
            chainSelector,
            proposalId,
            startTime,
            endTime
        );
    }

    function _sendVotes(uint64 chainSelector, uint256 proposalId) internal {
        VoteInfo memory votes = crossChainProposals[chainSelector][proposalId]
            .votesInfo;
        crossChainProposals[chainSelector][proposalId]
            .isVotesTransferred = true;
        bytes memory message = abi.encode(
            proposalId,
            votes.forVotes,
            votes.againstVotes,
            votes.abstrainVotes
        );

        // send only to base
        address votingContractAddress = supportedContracts[chainSelector];
        _sendMessage(
            chainSelector,
            votingContractAddress,
            abi.encode(MessageTypes.VotesInfo, message)
        );

        estimatedActiveCrossChainProposals[chainSelector][
            crossChainProposals[chainSelector][proposalId].activeProposalId
        ] = estimatedActiveCrossChainProposals[chainSelector][
            --totalEstimatedActiveCrossChainProposal[chainSelector]
        ];

        emit VotesSent(
            chainSelector,
            proposalId,
            votes.forVotes,
            votes.againstVotes,
            votes.abstrainVotes
        );
    }

    function _receiveVotes(
        uint64 chainSelector,
        uint256 proposalId,
        uint256 forVotes,
        uint256 againstVotes,
        uint256 abstrainVotes
    ) internal {
        if (votesCountedOn[proposalId][chainSelector])
            revert VotesAlreadyCountedOn(chainSelector, proposalId);
        votesCountedOn[proposalId][chainSelector] = true;
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
            chainSelector,
            proposalId,
            baseProposals[proposalId].crossChainVoteInfo.forVotes,
            baseProposals[proposalId].crossChainVoteInfo.againstVotes,
            baseProposals[proposalId].crossChainVoteInfo.abstrainVotes,
            forVotes,
            againstVotes,
            abstrainVotes
        );
    }

    function _min(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a > b) return b;
        return a;
    }

    function withdrawLinkTokens(address beneficiary) public onlyOwner {
        uint256 balance = linkToken.balanceOf(address(this));
        if (balance == 0) return;
        linkToken.transfer(beneficiary, balance);
    }
}
