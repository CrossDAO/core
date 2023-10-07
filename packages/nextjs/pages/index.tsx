import type { NextPage } from "next";
import Balances from "~~/components/Balances";
import ProposalsList from "~~/components/ProposalsList";
import Toggle from "~~/components/Toggle";

const Home: NextPage = () => {
  return (
    <>
      <div className="flex flex-grow pt-10 max-w-4xl w-full m-auto gap-8">
        <div className="w-64">
          <Balances />

          <div className="mt-6 flex justify-between items-center">
            Toggle Private mode <Toggle />
          </div>
        </div>
        <div>
          <ProposalsList />
        </div>
      </div>
    </>
  );
};

export default Home;
