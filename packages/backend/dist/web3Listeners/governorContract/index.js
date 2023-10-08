"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncGovernorContractEvent = void 0;
const EventIndexer_1 = require("../../EventIndexer");
const Governor_json_1 = __importDefault(require("../../abi/Governor.json"));
const ethers_1 = require("ethers");
function syncGovernorContractEvent(chainId, minBlock, address, provider) {
    return __awaiter(this, void 0, void 0, function* () {
        const contract = new ethers_1.Contract(address, Governor_json_1.default, provider);
        const SupportChainAddedEventHandler = new EventIndexer_1.EventHandler(provider, minBlock, chainId, contract, [
            ["chainId", "chainId", "int"],
            ["contractAddress", "contractAddress", "string"],
        ], "supportChainAddedEvent", "SupportChainAdded");
        const SupportChainRemovedEventHandler = new EventIndexer_1.EventHandler(provider, minBlock, chainId, contract, [["chainId", "chainId", "int"]], "supportChainRemovedEvent", "SupportChainRemoved");
        const DurationUpdatedEventHandler = new EventIndexer_1.EventHandler(provider, minBlock, chainId, contract, [["newDuration", "newDuration", "string"]], "durationUpdatedEvent", "DurationUpdated");
        const TokenStakedEventHandler = new EventIndexer_1.EventHandler(provider, minBlock, chainId, contract, [
            ["staker", "staker", "string"],
            ["amount", "amount", "string"],
            ["totalStaked", "totalStaked", "string"],
        ], "tokenStakedEvent", "TokenStaked");
        const ProposalCreatedEventHandler = new EventIndexer_1.EventHandler(provider, minBlock, chainId, contract, [
            ["proposalId", "proposalId", "string"],
            ["proposer", "proposer", "string"],
            ["targets", "targets", "string[]"],
            ["values", "values", "string[]"],
            ["signatures", "signatures", "string[]"],
            ["calldatas", "calldatas", "string[]"],
            ["description", "description", "string"],
            ["startTime", "startTime", "string"],
            ["endTime", "endTime", "string"],
        ], "proposalCreatedEvent", "ProposalCreated");
        const CrossChainProposalCreatedEventHandler = new EventIndexer_1.EventHandler(provider, minBlock, chainId, contract, [
            ["chainId", "chainId", "int"],
            ["proposalId", "proposalId", "string"],
            ["startTime", "startTime", "string"],
            ["endTime", "endTime", "string"],
        ], "crossChainProposalCreatedEvent", "CrossChainProposalCreated");
        const VotedOnBaseChainProposalEventHandler = new EventIndexer_1.EventHandler(provider, minBlock, chainId, contract, [
            ["proposalId", "proposalId", "string"],
            ["voter", "voter", "string"],
            ["totalForVotes", "totalForVotes", "string"],
            ["totalAgainstVotes", "totalAgainstVotes", "string"],
            ["totalAbstrainVotes", "totalAbstrainVotes", "string"],
            ["forVotes", "forVotes", "string"],
            ["againstVotes", "againstVotes", "string"],
            ["abstrainVotes", "abstrainVotes", "string"],
        ], "votedOnBaseChainProposalEvent", "VotedOnBaseChainProposal");
        const VotedOnCrossChainProposalEventHandler = new EventIndexer_1.EventHandler(provider, minBlock, chainId, contract, [
            ["chainId", "chainId", "int"],
            ["proposalId", "proposalId", "string"],
            ["voter", "voter", "string"],
            ["totalForVotes", "totalForVotes", "string"],
            ["totalAgainstVotes", "totalAgainstVotes", "string"],
            ["totalAbstrainVotes", "totalAbstrainVotes", "string"],
            ["forVotes", "forVotes", "string"],
            ["againstVotes", "againstVotes", "string"],
            ["abstrainVotes", "abstrainVotes", "string"],
        ], "votedOnCrossChainProposalEvent", "VotedOnCrossChainProposal");
        const VotesSentEventHandler = new EventIndexer_1.EventHandler(provider, minBlock, chainId, contract, [
            ["chainId", "chainId", "int"],
            ["proposalId", "proposalId", "string"],
            ["forVotes", "forVotes", "string"],
            ["againstVotes", "againstVotes", "string"],
            ["abstrainVotes", "abstrainVotes", "string"],
        ], "votesSentEvent", "VotesSent");
        const VotesReceivedEventHandler = new EventIndexer_1.EventHandler(provider, minBlock, chainId, contract, [
            ["chainId", "chainId", "int"],
            ["proposalId", "proposalId", "string"],
            ["totalForVotes", "totalForVotes", "string"],
            ["totalAgainstVotes", "totalAgainstVotes", "string"],
            ["totalAbstrainVotes", "totalAbstrainVotes", "string"],
            ["forVotes", "forVotes", "string"],
            ["againstVotes", "againstVotes", "string"],
            ["abstrainVotes", "abstrainVotes", "string"],
        ], "votesReceivedEvent", "VotesReceived");
        const TokenUnstakedEventHandler = new EventIndexer_1.EventHandler(provider, minBlock, chainId, contract, [
            ["staker", "staker", "string"],
            ["amount", "amount", "string"],
            ["totalStaked", "totalStaked", "string"],
        ], "tokenUnstakedEvent", "TokenUnstaked");
        const ProposalExecutedEventHandler = new EventIndexer_1.EventHandler(provider, minBlock, chainId, contract, [
            ["proposalId", "proposalId", "string"],
            ["executer", "executer", "string"],
        ], "proposalExecutedEvent", "ProposalExecuted");
        yield SupportChainAddedEventHandler.syncEvent();
        yield SupportChainRemovedEventHandler.syncEvent();
        yield DurationUpdatedEventHandler.syncEvent();
        yield TokenStakedEventHandler.syncEvent();
        yield ProposalCreatedEventHandler.syncEvent();
        yield CrossChainProposalCreatedEventHandler.syncEvent();
        yield VotedOnBaseChainProposalEventHandler.syncEvent();
        yield VotedOnCrossChainProposalEventHandler.syncEvent();
        yield VotesSentEventHandler.syncEvent();
        yield VotesReceivedEventHandler.syncEvent();
        yield TokenUnstakedEventHandler.syncEvent();
        yield ProposalExecutedEventHandler.syncEvent();
    });
}
exports.syncGovernorContractEvent = syncGovernorContractEvent;
