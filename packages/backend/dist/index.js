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
const web3Listeners_1 = require("./web3Listeners");
const dotenv_1 = __importDefault(require("dotenv"));
const ethers_1 = require("ethers");
dotenv_1.default.config();
const supportedChains = {
    "polygon-mumbai": {
        id: 6,
        token: "0x07e7dA1c834EF1AbF6fDE816A98300DCd6Ead315",
        address: "0x470841a01F293dc88b0aE56718B0a3018cA83E82",
        provider: new ethers_1.ethers.WebSocketProvider(process.env.POLYGON_MUMBAI_RPC_URL || ""),
        minBlock: 40950724,
    },
    "base-goerli": {
        id: 30,
        token: "0x07e7dA1c834EF1AbF6fDE816A98300DCd6Ead315",
        address: "0x470841a01F293dc88b0aE56718B0a3018cA83E82",
        provider: new ethers_1.ethers.WebSocketProvider(process.env.BASE_GOERLI_RPC_URL || ""),
        minBlock: 10758996,
    },
};
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        for (const networkConfig of Object.values(supportedChains)) {
            yield (0, web3Listeners_1.syncEvents)(networkConfig);
        }
    });
}
main();
