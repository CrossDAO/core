-- CreateTable
CREATE TABLE "SupportChainAddedEvent" (
    "blockNumber" INTEGER NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "transactionIndex" INTEGER NOT NULL,
    "logIndex" INTEGER NOT NULL,
    "chainId" INTEGER NOT NULL,
    "contractAddress" TEXT NOT NULL,

    CONSTRAINT "SupportChainAddedEvent_pkey" PRIMARY KEY ("blockNumber","transactionHash","transactionIndex","logIndex")
);

-- CreateTable
CREATE TABLE "SupportChainRemovedEvent" (
    "blockNumber" INTEGER NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "transactionIndex" INTEGER NOT NULL,
    "logIndex" INTEGER NOT NULL,
    "chainId" INTEGER NOT NULL,

    CONSTRAINT "SupportChainRemovedEvent_pkey" PRIMARY KEY ("blockNumber","transactionHash","transactionIndex","logIndex")
);

-- CreateTable
CREATE TABLE "DurationUpdatedEvent" (
    "blockNumber" INTEGER NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "transactionIndex" INTEGER NOT NULL,
    "logIndex" INTEGER NOT NULL,
    "newDuration" TEXT NOT NULL,

    CONSTRAINT "DurationUpdatedEvent_pkey" PRIMARY KEY ("blockNumber","transactionHash","transactionIndex","logIndex")
);

-- CreateTable
CREATE TABLE "TokenStakedEvent" (
    "blockNumber" INTEGER NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "transactionIndex" INTEGER NOT NULL,
    "logIndex" INTEGER NOT NULL,
    "amount" TEXT NOT NULL,
    "totalStaked" TEXT NOT NULL,
    "staker" TEXT NOT NULL,

    CONSTRAINT "TokenStakedEvent_pkey" PRIMARY KEY ("blockNumber","transactionHash","transactionIndex","logIndex")
);

-- CreateTable
CREATE TABLE "ProposalCreatedEvent" (
    "blockNumber" INTEGER NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "transactionIndex" INTEGER NOT NULL,
    "logIndex" INTEGER NOT NULL,
    "proposalId" TEXT NOT NULL,
    "proposer" TEXT NOT NULL,
    "targets" VARCHAR(3000) NOT NULL,
    "values" VARCHAR(3000) NOT NULL,
    "signatures" VARCHAR(3000) NOT NULL,
    "calldatas" VARCHAR(3000) NOT NULL,
    "description" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProposalCreatedEvent_pkey" PRIMARY KEY ("blockNumber","transactionHash","transactionIndex","logIndex")
);

-- CreateTable
CREATE TABLE "CrossChainProposalCreatedEvent" (
    "blockNumber" INTEGER NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "transactionIndex" INTEGER NOT NULL,
    "logIndex" INTEGER NOT NULL,
    "chainId" INTEGER NOT NULL,
    "proposalId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrossChainProposalCreatedEvent_pkey" PRIMARY KEY ("blockNumber","transactionHash","transactionIndex","logIndex")
);

-- CreateTable
CREATE TABLE "VotedOnBaseChainProposalEvent" (
    "blockNumber" INTEGER NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "transactionIndex" INTEGER NOT NULL,
    "logIndex" INTEGER NOT NULL,
    "proposalId" TEXT NOT NULL,
    "voter" TEXT NOT NULL,
    "totalForVotes" TEXT NOT NULL,
    "totalAgainstVotes" TEXT NOT NULL,
    "totalAbstrainVotes" TEXT NOT NULL,
    "forVotes" TEXT NOT NULL,
    "againstVotes" TEXT NOT NULL,
    "abstrainVotes" TEXT NOT NULL,

    CONSTRAINT "VotedOnBaseChainProposalEvent_pkey" PRIMARY KEY ("blockNumber","transactionHash","transactionIndex","logIndex")
);

-- CreateTable
CREATE TABLE "VotedOnCrossChainProposalEvent" (
    "blockNumber" INTEGER NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "transactionIndex" INTEGER NOT NULL,
    "logIndex" INTEGER NOT NULL,
    "chainId" INTEGER NOT NULL,
    "proposalId" TEXT NOT NULL,
    "voter" TEXT NOT NULL,
    "totalForVotes" TEXT NOT NULL,
    "totalAgainstVotes" TEXT NOT NULL,
    "totalAbstrainVotes" TEXT NOT NULL,
    "forVotes" TEXT NOT NULL,
    "againstVotes" TEXT NOT NULL,
    "abstrainVotes" TEXT NOT NULL,

    CONSTRAINT "VotedOnCrossChainProposalEvent_pkey" PRIMARY KEY ("blockNumber","transactionHash","transactionIndex","logIndex")
);

-- CreateTable
CREATE TABLE "VotesSentEvent" (
    "blockNumber" INTEGER NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "transactionIndex" INTEGER NOT NULL,
    "logIndex" INTEGER NOT NULL,
    "chainId" INTEGER NOT NULL,
    "proposalId" TEXT NOT NULL,
    "forVotes" TEXT NOT NULL,
    "againstVotes" TEXT NOT NULL,
    "abstrainVotes" TEXT NOT NULL,

    CONSTRAINT "VotesSentEvent_pkey" PRIMARY KEY ("blockNumber","transactionHash","transactionIndex","logIndex")
);

-- CreateTable
CREATE TABLE "VotesReceivedEvent" (
    "blockNumber" INTEGER NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "transactionIndex" INTEGER NOT NULL,
    "logIndex" INTEGER NOT NULL,
    "chainId" INTEGER NOT NULL,
    "proposalId" TEXT NOT NULL,
    "totalForVotes" TEXT NOT NULL,
    "totalAgainstVotes" TEXT NOT NULL,
    "totalAbstrainVotes" TEXT NOT NULL,
    "forVotes" TEXT NOT NULL,
    "againstVotes" TEXT NOT NULL,
    "abstrainVotes" TEXT NOT NULL,

    CONSTRAINT "VotesReceivedEvent_pkey" PRIMARY KEY ("blockNumber","transactionHash","transactionIndex","logIndex")
);

-- CreateTable
CREATE TABLE "TokenUnstakedEvent" (
    "blockNumber" INTEGER NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "transactionIndex" INTEGER NOT NULL,
    "logIndex" INTEGER NOT NULL,
    "staker" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "totalStaked" TEXT NOT NULL,

    CONSTRAINT "TokenUnstakedEvent_pkey" PRIMARY KEY ("blockNumber","transactionHash","transactionIndex","logIndex")
);

-- CreateTable
CREATE TABLE "ProposalExecutedEvent" (
    "blockNumber" INTEGER NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "transactionIndex" INTEGER NOT NULL,
    "logIndex" INTEGER NOT NULL,
    "proposalId" TEXT NOT NULL,
    "executer" TEXT NOT NULL,

    CONSTRAINT "ProposalExecutedEvent_pkey" PRIMARY KEY ("blockNumber","transactionHash","transactionIndex","logIndex")
);
