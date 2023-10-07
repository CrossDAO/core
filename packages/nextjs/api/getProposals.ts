import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const getProposals = async () => {
  const response = await axios.get("/api/proposals").catch(err => {
    console.error(err);
    return { data: [] };
  });

  return response.data;
};

export const useGetProposals = () => {
  return useQuery({
    queryKey: ["proposals"],
    queryFn: () => getProposals(),
  });
};
