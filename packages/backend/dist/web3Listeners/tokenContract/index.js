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
exports.syncTokenContractEvent = void 0;
const EventIndexer_1 = require("../../EventIndexer");
const Token_json_1 = __importDefault(require("../../abi/Token.json"));
const ethers_1 = require("ethers");
function syncTokenContractEvent(chainId, minBlock, address, provider) {
    return __awaiter(this, void 0, void 0, function* () {
        const contract = new ethers_1.Contract(address, Token_json_1.default, provider);
        const TransferEventHandler = new EventIndexer_1.EventHandler(provider, minBlock, chainId, contract, [
            ["from", "from", "string"],
            ["to", "to", "string"],
            ["value", "value", "string"],
        ], "TransferEvent", "Transfer");
        const ApprovalEventHandler = new EventIndexer_1.EventHandler(provider, minBlock, chainId, contract, [
            ["owner", "owner", "string"],
            ["spender", "spender", "string"],
            ["value", "value", "string"],
        ], "ApprovalEvent", "Approval");
        yield Promise.all([
            ApprovalEventHandler.syncEvent(),
            TransferEventHandler.syncEvent(),
        ]);
    });
}
exports.syncTokenContractEvent = syncTokenContractEvent;
