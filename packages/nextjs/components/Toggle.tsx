import { useState } from "react";
import classNames from "classnames";
import { v4 as uuidv4 } from "uuid";

type ToggleProps = {
  name?: string;
  defaultChecked?: boolean;
  onChange?: (value: boolean) => void;
};

const Toggle: React.FC<ToggleProps> = ({ name = uuidv4(), defaultChecked = false, onChange }) => {
  const [checked, setChecked] = useState(defaultChecked);

  const handleToggle = () => {
    const newChecked = !checked;
    setChecked(newChecked);

    if (onChange) {
      onChange(newChecked);
    }
  };

  return (
    <div
      className={classNames(
        "relative inline-block w-14 select-none rounded-full border-4 border-transparent align-middle transition duration-200 ease-in",
      )}
    >
      <input type="checkbox" name={name} id={name} checked={checked} onChange={handleToggle} className="hidden" />
      <label
        htmlFor={name}
        className={classNames(
          "block h-6 cursor-pointer overflow-hidden rounded-full border-2 transition-colors duration-200 ease-in",
          {
            ["border-purple-700 bg-purple-700"]: checked,
            ["border-accent-subdued bg-accent-subdued hover:border-primary-accent-200 hover:bg-primary-accent-200"]:
              !checked,
          },
        )}
      >
        <span
          className={classNames(
            "block h-5 w-5 translate-x-0 transform rounded-full bg-white shadow transition-transform duration-200 ease-in",
            { ["translate-x-6"]: checked },
          )}
        ></span>
      </label>
    </div>
  );
};

export default Toggle;
