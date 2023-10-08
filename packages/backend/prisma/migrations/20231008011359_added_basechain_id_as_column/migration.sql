/*
  Warnings:

  - The primary key for the `CrossChainProposalCreatedEvent` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `DurationUpdatedEvent` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ProposalCreatedEvent` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ProposalExecutedEvent` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `SupportChainAddedEvent` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `SupportChainRemovedEvent` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `TokenStakedEvent` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `TokenUnstakedEvent` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `VotedOnBaseChainProposalEvent` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `VotedOnCrossChainProposalEvent` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `VotesReceivedEvent` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `VotesSentEvent` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `baseChainId` to the `CrossChainProposalCreatedEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `baseChainId` to the `DurationUpdatedEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `baseChainId` to the `ProposalCreatedEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `baseChainId` to the `ProposalExecutedEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `baseChainId` to the `SupportChainAddedEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `baseChainId` to the `SupportChainRemovedEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `baseChainId` to the `TokenStakedEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `baseChainId` to the `TokenUnstakedEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `baseChainId` to the `VotedOnBaseChainProposalEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `baseChainId` to the `VotedOnCrossChainProposalEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `baseChainId` to the `VotesReceivedEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `baseChainId` to the `VotesSentEvent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CrossChainProposalCreatedEvent" DROP CONSTRAINT "CrossChainProposalCreatedEvent_pkey",
ADD COLUMN     "baseChainId" INTEGER NOT NULL,
ADD CONSTRAINT "CrossChainProposalCreatedEvent_pkey" PRIMARY KEY ("baseChainId", "blockNumber", "transactionHash", "transactionIndex", "logIndex");

-- AlterTable
ALTER TABLE "DurationUpdatedEvent" DROP CONSTRAINT "DurationUpdatedEvent_pkey",
ADD COLUMN     "baseChainId" INTEGER NOT NULL,
ADD CONSTRAINT "DurationUpdatedEvent_pkey" PRIMARY KEY ("baseChainId", "blockNumber", "transactionHash", "transactionIndex", "logIndex");

-- AlterTable
ALTER TABLE "ProposalCreatedEvent" DROP CONSTRAINT "ProposalCreatedEvent_pkey",
ADD COLUMN     "baseChainId" INTEGER NOT NULL,
ADD CONSTRAINT "ProposalCreatedEvent_pkey" PRIMARY KEY ("baseChainId", "blockNumber", "transactionHash", "transactionIndex", "logIndex");

-- AlterTable
ALTER TABLE "ProposalExecutedEvent" DROP CONSTRAINT "ProposalExecutedEvent_pkey",
ADD COLUMN     "baseChainId" INTEGER NOT NULL,
ADD CONSTRAINT "ProposalExecutedEvent_pkey" PRIMARY KEY ("baseChainId", "blockNumber", "transactionHash", "transactionIndex", "logIndex");

-- AlterTable
ALTER TABLE "SupportChainAddedEvent" DROP CONSTRAINT "SupportChainAddedEvent_pkey",
ADD COLUMN     "baseChainId" INTEGER NOT NULL,
ADD CONSTRAINT "SupportChainAddedEvent_pkey" PRIMARY KEY ("baseChainId", "blockNumber", "transactionHash", "transactionIndex", "logIndex");

-- AlterTable
ALTER TABLE "SupportChainRemovedEvent" DROP CONSTRAINT "SupportChainRemovedEvent_pkey",
ADD COLUMN     "baseChainId" INTEGER NOT NULL,
ADD CONSTRAINT "SupportChainRemovedEvent_pkey" PRIMARY KEY ("baseChainId", "blockNumber", "transactionHash", "transactionIndex", "logIndex");

-- AlterTable
ALTER TABLE "TokenStakedEvent" DROP CONSTRAINT "TokenStakedEvent_pkey",
ADD COLUMN     "baseChainId" INTEGER NOT NULL,
ADD CONSTRAINT "TokenStakedEvent_pkey" PRIMARY KEY ("baseChainId", "blockNumber", "transactionHash", "transactionIndex", "logIndex");

-- AlterTable
ALTER TABLE "TokenUnstakedEvent" DROP CONSTRAINT "TokenUnstakedEvent_pkey",
ADD COLUMN     "baseChainId" INTEGER NOT NULL,
ADD CONSTRAINT "TokenUnstakedEvent_pkey" PRIMARY KEY ("baseChainId", "blockNumber", "transactionHash", "transactionIndex", "logIndex");

-- AlterTable
ALTER TABLE "VotedOnBaseChainProposalEvent" DROP CONSTRAINT "VotedOnBaseChainProposalEvent_pkey",
ADD COLUMN     "baseChainId" INTEGER NOT NULL,
ADD CONSTRAINT "VotedOnBaseChainProposalEvent_pkey" PRIMARY KEY ("baseChainId", "blockNumber", "transactionHash", "transactionIndex", "logIndex");

-- AlterTable
ALTER TABLE "VotedOnCrossChainProposalEvent" DROP CONSTRAINT "VotedOnCrossChainProposalEvent_pkey",
ADD COLUMN     "baseChainId" INTEGER NOT NULL,
ADD CONSTRAINT "VotedOnCrossChainProposalEvent_pkey" PRIMARY KEY ("baseChainId", "blockNumber", "transactionHash", "transactionIndex", "logIndex");

-- AlterTable
ALTER TABLE "VotesReceivedEvent" DROP CONSTRAINT "VotesReceivedEvent_pkey",
ADD COLUMN     "baseChainId" INTEGER NOT NULL,
ADD CONSTRAINT "VotesReceivedEvent_pkey" PRIMARY KEY ("baseChainId", "blockNumber", "transactionHash", "transactionIndex", "logIndex");

-- AlterTable
ALTER TABLE "VotesSentEvent" DROP CONSTRAINT "VotesSentEvent_pkey",
ADD COLUMN     "baseChainId" INTEGER NOT NULL,
ADD CONSTRAINT "VotesSentEvent_pkey" PRIMARY KEY ("baseChainId", "blockNumber", "transactionHash", "transactionIndex", "logIndex");
