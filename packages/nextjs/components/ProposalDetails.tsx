import { IProposal } from "./ProposalItem";
import Spinner from "./Spinner";

type ProposalDetailsProps = {
  proposal: IProposal;
  isLoading: boolean;
};

const ProposalDetails = ({ proposal, isLoading }: ProposalDetailsProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center flex-col flex-grow pt-10 max-w-5xl m-auto w-full">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="gap-10 flex flex-col mt-6">
      <div className="flex">{proposal?.description}</div>
    </div>
  );
};

export default ProposalDetails;
