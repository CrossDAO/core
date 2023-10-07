import type { NextPage } from "next";
import ProposalsList from "~~/components/ProposalsList";

const Home: NextPage = () => {
  return (
    <>
      <div className="flex flex-col flex-grow pt-10 max-w-2xl w-full m-auto">
        <div className="px-5">
          <h1>
            <span className="text-5xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-400">
              Proposals
            </span>
          </h1>
        </div>

        <ProposalsList />
      </div>
    </>
  );
};

export default Home;
