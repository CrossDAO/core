import { useState } from "react";

const CreateProposal = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div className="gap-4 flex flex-col pb-10">
      <div>
        <label className="text-primary-content">Title</label>
        <input
          type="text"
          value={title}
          className="mt-2 rounded-full input input-bordered w-full bg-transparent focus:border-base-100 border-base-200"
          onChange={e => setTitle(e.target.value)}
        />
      </div>

      <div>
        <label className="text-primary-content">Description</label>
        <textarea
          value={description}
          className="mt-2 rounded-2xl input input-bordered w-full py-2 h-40 bg-transparent focus:border-base-100 border-base-200"
          onChange={e => setDescription(e.target.value)}
        />
      </div>
    </div>
  );
};

export default CreateProposal;
