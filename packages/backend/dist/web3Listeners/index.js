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
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncEvents = void 0;
const governorContract_1 = require("./governorContract");
const tokenContract_1 = require("./tokenContract");
function syncEvents({ id: chainId, minBlock, address: governorAddress, token: tokenAddress, provider, }) {
    return __awaiter(this, void 0, void 0, function* () {
        yield Promise.all([
            (0, governorContract_1.syncGovernorContractEvent)(chainId, minBlock, governorAddress, provider),
            (0, tokenContract_1.syncTokenContractEvent)(chainId, minBlock, tokenAddress, provider),
        ]);
    });
}
exports.syncEvents = syncEvents;
