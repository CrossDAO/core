import { useRouter } from "next/router";
import type { NextPage } from "next";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import CreateProposal from "~~/components/CreateProposal";

const Create: NextPage = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col flex-grow pt-10 max-w-2xl w-full m-auto">
      <button className="flex items-center gap-2 opacity-50 hover:opacity-100" onClick={() => router.push("/")}>
        <ArrowLeftIcon className="w-4 h-4" /> Back
      </button>

      <h1 className="my-6">
        <span className="text-5xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-400 ">
          Create
        </span>
      </h1>

      <CreateProposal />
    </div>
  );
};

export default Create;
