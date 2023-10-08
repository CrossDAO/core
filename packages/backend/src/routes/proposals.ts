import { PrismaClient } from "@prisma/client";
import Router from "express";

const router = Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  const proposals: Record<string, any>[] =
    await prisma.proposalCreatedEvent.findMany();

  const baseChainVoteEvents =
    await prisma.votedOnBaseChainProposalEvent.findMany({
      orderBy: [{ blockNumber: "asc" }, { logIndex: "asc" }],
    });

  const baseChainVotes: Record<number, Record<string, any>> = {};

  for (let event of baseChainVoteEvents) {
    if (!Object.keys(baseChainVotes).includes(event.baseChainId.toString())) {
      baseChainVotes[event.baseChainId] = {};
    }
    baseChainVotes[event.baseChainId][event.proposalId] = {
      totalForVotes: event.totalForVotes,
      totalAgainstVotes: event.totalAgainstVotes,
      totalAbstrainVotes: event.totalAbstrainVotes,
    };
  }

  const CrossChainVoteEvents =
    await prisma.votedOnCrossChainProposalEvent.findMany({
      orderBy: [{ blockNumber: "asc" }, { logIndex: "asc" }],
    });

  const crossChainVotes: Record<
    number,
    Record<string, Record<string, any>>
  > = {};

  for (let event of CrossChainVoteEvents) {
    if (!Object.keys(crossChainVotes).includes(event.chainId.toString())) {
      crossChainVotes[event.chainId] = {};
    }
    if (
      !Object.keys(crossChainVotes[event.chainId]).includes(
        event.baseChainId.toString()
      )
    ) {
      crossChainVotes[event.chainId][event.baseChainId] = {};
    }
    crossChainVotes[event.chainId][event.baseChainId][event.proposalId] = {
      totalForVotes: event.totalForVotes,
      totalAgainstVotes: event.totalAgainstVotes,
      totalAbstrainVotes: event.totalAbstrainVotes,
    };
  }

  for (let id = 0; id < proposals.length; id++) {
    const proposal = proposals[id];
    proposals[id].votes = {
      baseChainVotes: baseChainVotes[proposal.baseChainId] && {
        totalForVotes: 0,
        totalAgainstVotes: 0,
        totalAbstrainVotes: 0,
      },
      crossChainVotes: crossChainVotes[proposal.baseChainId] && {},
    };
  }

  res.json({ proposals });
});

export default router;
