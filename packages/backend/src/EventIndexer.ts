import { PrismaClient } from "@prisma/client";
import { Contract, ContractEvent, Provider, ethers } from "ethers";

const prisma = new PrismaClient();

export class EventHandler {
  baseChainId: number;
  contract: Contract;
  fields: string[][];
  table: any;
  filter: ContractEvent;
  topic: string;
  provider: Provider;
  minBlock: number;

  constructor(
    provider: Provider,
    minBlock: number,
    baseChainId: number,
    contract: Contract,
    fields: string[][],
    table: string,
    eventName: string
  ) {
    this.provider = provider;
    this.minBlock = minBlock;
    this.baseChainId = baseChainId;
    this.contract = contract;
    this.fields = fields;
    this.table = (prisma as any)[table];
    this.filter = contract.filters[eventName];
    this.topic = this.getTopic();
  }

  async syncEvent() {
    this.startListener();
    await this.syncEventTillNow();
  }

  startListener() {
    this.contract.on(this.filter, async (...args) => {
      const eventEmitted = args[args.length - 1];
      await this.addEvent(eventEmitted);
    });
  }

  async syncEventTillNow() {
    const lastEvent = await this.table.findFirst({
      orderBy: { blockNumber: "desc" },
    });
    const lastBlock = lastEvent?.blockNumber || this.minBlock;
    let startBlock = lastBlock;
    let tillBlock = Number(await this.provider.getBlockNumber());
    let blocks = tillBlock - startBlock;
    while (tillBlock >= startBlock) {
      try {
        const emittedEvents = await this.contract.queryFilter(
          this.filter,
          startBlock,
          Math.min(startBlock + blocks, tillBlock)
        );
        for (const eventEmitted of emittedEvents) {
          await this.addEvent(eventEmitted);
        }
        startBlock += blocks + 1;
      } catch (err) {
        blocks = Math.floor(blocks / 2);
      }
    }
  }

  async addEvent(event: any) {
    let { blockNumber, transactionHash, transactionIndex, index, log } = event;
    if (log) {
      blockNumber = log.blockNumber;
      transactionHash = log.transactionHash;
      transactionIndex = log.transactionIndex;
      index = log.index;
    }

    const data = this.parse(event);

    const oldEvent = await this.table.findUnique({
      where: {
        baseChainId_blockNumber_transactionHash_transactionIndex_logIndex: {
          baseChainId: this.baseChainId,
          blockNumber,
          transactionHash,
          transactionIndex,
          logIndex: index,
        },
      },
    });

    if (oldEvent) return;

    await this.table.create({ data: { ...data } });
  }

  parse(event: any) {
    let { blockNumber, transactionHash, transactionIndex, index, log, args } =
      event;
    if (log) {
      blockNumber = log.blockNumber;
      transactionHash = log.transactionHash;
      transactionIndex = log.transactionIndex;
      index = log.index;
    }

    const data: Record<string, string | number> = {
      baseChainId: this.baseChainId,
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

  encodeField(type: string, value: any) {
    if (type === "int") return Number(value);
    if (type === "int[]") {
      if (value.length === 0) return "";
      return value.map((el: any) => Number(el).toString()).join(",");
    }
    if (type === "string[]") {
      if (value.length === 0) return "";
      return value.join(",");
    }
    return value.toString();
  }

  decodeField(type: string, value: any) {
    if (type === "int[]") {
      return value.split(",");
    }
    if (type === "string[]") {
      return value.split(",");
    }
    return value;
  }

  getAllRouteHandler(filters = []) {
    return (async (req: any, res: any) => {
      const fromBlock = Number(req.query.fromBlock || 0);
      const toBlock = Number(
        req.query.toBlock || (await this.provider.getBlockNumber())
      );

      const filterObj: Record<string, any> = {};
      for (const filter of filters) {
        const type = this.fields.filter(
          (field: any) => field[1] === filter
        )[0][2];
        filterObj[filter] = req.query[filter]
          ? this.encodeField(type, req.query[filter])
          : undefined;
      }

      let events = await this.table.findMany({
        where: { blockNumber: { gte: fromBlock, lte: toBlock }, ...filterObj },
      });
      events = events.map((event: any) => {
        for (const [_argName, fieldName, fieldType] of this.fields) {
          event[fieldName] = this.decodeField(fieldType, event[fieldName]);
        }
        return event;
      });
      res.json({ events });
    }).bind(this);
  }

  getTopic() {
    const { name, inputs } = this.filter.fragment;
    let eventSelector = `${name}(${inputs
      .map((input) => input.type)
      .join(",")})`;
    const topic = ethers.keccak256(ethers.toUtf8Bytes(eventSelector));
    return topic;
  }
}
