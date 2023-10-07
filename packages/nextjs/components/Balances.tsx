const Balances = () => {
  return (
    <div className="gap-4 flex flex-col max-w-2xl w-full m-auto border border-base-200 p-4 rounded-2xl">
      <h1>
        <span className="text-2xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-400">
          Balances
        </span>
      </h1>
      <div className="flex flex-col gap-4">
        <div className="flex-1">
          <div className="w-full text-lg border-b border-base-200">Public</div>

          <div className="w-full flex flex-col gap-1 text-sm mt-2">
            <div className="flex justify-between">
              <div className="text-primary-content">Unstaked</div>
              <div>30.0</div>
            </div>

            <div className="flex justify-between">
              <div className="text-primary-content">Staked</div>
              <div>10.0</div>
            </div>
          </div>
        </div>

        <div className="flex-1 mt-5">
          <div className="w-full text-lg border-b border-base-200">Private</div>

          <div className="w-full flex flex-col gap-1 text-sm mt-2">
            <div className="flex justify-between">
              <div className="text-primary-content">Unstaked</div>
              <div>20.0</div>
            </div>

            <div className="flex justify-between">
              <div className="text-primary-content">Staked</div>
              <div>5.0</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Balances;
