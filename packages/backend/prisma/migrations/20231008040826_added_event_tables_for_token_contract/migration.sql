-- CreateTable
CREATE TABLE "TransferEvent" (
    "baseChainId" INTEGER NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "transactionIndex" INTEGER NOT NULL,
    "logIndex" INTEGER NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "TransferEvent_pkey" PRIMARY KEY ("baseChainId","blockNumber","transactionHash","transactionIndex","logIndex")
);

-- CreateTable
CREATE TABLE "ApprovalEvent" (
    "baseChainId" INTEGER NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "transactionIndex" INTEGER NOT NULL,
    "logIndex" INTEGER NOT NULL,
    "owner" TEXT NOT NULL,
    "spender" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "ApprovalEvent_pkey" PRIMARY KEY ("baseChainId","blockNumber","transactionHash","transactionIndex","logIndex")
);
