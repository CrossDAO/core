import { useEffect, useState } from "react";

const useHydrated = () => {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  return { hasHydrated };
};

export default useHydrated;
