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
exports.EventHandler = void 0;
const client_1 = require("@prisma/client");
const ethers_1 = require("ethers");
const prisma = new client_1.PrismaClient();
class EventHandler {
    constructor(provider, minBlock, chainId, contract, fields, table, eventName) {
        this.provider = provider;
        this.minBlock = minBlock;
        this.chainId = chainId;
        this.contract = contract;
        this.fields = fields;
        this.table = prisma[table];
        this.filter = contract.filters[eventName];
        this.topic = this.getTopic();
    }
    syncEvent() {
        return __awaiter(this, void 0, void 0, function* () {
            this.startListener();
            yield this.syncEventTillNow();
        });
    }
    startListener() {
        this.contract.on(this.filter, (...args) => __awaiter(this, void 0, void 0, function* () {
            const eventEmitted = args[args.length - 1];
            yield this.addEvent(eventEmitted);
        }));
    }
    syncEventTillNow() {
        return __awaiter(this, void 0, void 0, function* () {
            const lastEvent = yield this.table.findFirst({
                where: { manualEntry: false },
                orderBy: { blockNumber: "desc" },
            });
            const lastBlock = (lastEvent === null || lastEvent === void 0 ? void 0 : lastEvent.blockNumber) || this.minBlock;
            let startBlock = lastBlock;
            let tillBlock = Number(yield this.provider.getBlockNumber());
            let blocks = tillBlock - startBlock;
            while (tillBlock >= startBlock) {
                try {
                    const emittedEvents = yield this.contract.queryFilter(this.filter, startBlock, Math.min(startBlock + blocks, tillBlock));
                    for (const eventEmitted of emittedEvents) {
                        yield this.addEvent(eventEmitted);
                    }
                    startBlock += blocks + 1;
                }
                catch (err) {
                    blocks = Math.floor(blocks / 2);
                }
            }
        });
    }
    addEvent(event) {
        return __awaiter(this, void 0, void 0, function* () {
            let { blockNumber, transactionHash, transactionIndex, index, log } = event;
            if (log) {
                blockNumber = log.blockNumber;
                transactionHash = log.transactionHash;
                transactionIndex = log.transactionIndex;
                index = log.index;
            }
            const data = this.parse(event);
            const oldEvent = yield this.table.findUnique({
                where: {
                    chainId_blockNumber_transactionHash_transactionIndex_logIndex: {
                        chainId: this.chainId,
                        blockNumber,
                        transactionHash,
                        transactionIndex,
                        logIndex: index,
                    },
                },
            });
            if (oldEvent)
                return;
            yield this.table.create({ data: Object.assign({}, data) });
        });
    }
    parse(event) {
        let { blockNumber, transactionHash, transactionIndex, index, log, args } = event;
        if (log) {
            blockNumber = log.blockNumber;
            transactionHash = log.transactionHash;
            transactionIndex = log.transactionIndex;
            index = log.index;
        }
        const data = {
            chainId: this.chainId,
            blockNumber,
            transactionHash,
            transactionIndex,
            logIndex: index,
        };
        for (const [argName, fieldName, fieldType] of this.fields) {
            data[fieldName] = this.encodeField(fieldType, args[argName]);
        }
        return data;
    }
    encodeField(type, value) {
        if (type === "string")
            return value;
        if (type === "bigint")
            return value;
        if (type === "int")
            return Number(value);
        if (type === "int[]") {
            return value.map((el) => Number(el).toString()).join(",");
        }
        if (type === "string[]") {
            return value.join(",");
        }
        return value;
    }
    decodeField(type, value) {
        if (type === "int[]") {
            return value.split(",");
        }
        if (type === "string[]") {
            return value.split(",");
        }
        return value;
    }
    getAllRouteHandler(filters = []) {
        return ((req, res) => __awaiter(this, void 0, void 0, function* () {
            const fromBlock = Number(req.query.fromBlock || 0);
            const toBlock = Number(req.query.toBlock || (yield this.provider.getBlockNumber()));
            const filterObj = {};
            for (const filter of filters) {
                const type = this.fields.filter((field) => field[1] === filter)[0][2];
                filterObj[filter] = req.query[filter]
                    ? this.encodeField(type, req.query[filter])
                    : undefined;
            }
            let events = yield this.table.findMany({
                where: Object.assign({ blockNumber: { gte: fromBlock, lte: toBlock } }, filterObj),
            });
            events = events.map((event) => {
                for (const [_argName, fieldName, fieldType] of this.fields) {
                    event[fieldName] = this.decodeField(fieldType, event[fieldName]);
                }
                return event;
            });
            res.json({ events });
        })).bind(this);
    }
    getTopic() {
        const { name, inputs } = this.filter.fragment;
        let eventSelector = `${name}(${inputs
            .map((input) => input.type)
            .join(",")})`;
        const topic = ethers_1.ethers.keccak256(ethers_1.ethers.toUtf8Bytes(eventSelector));
        return topic;
    }
}
exports.EventHandler = EventHandler;
