import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// const mockedProposals = [
//   {
//     id: 1,
//     title: "New proposal",
//     description: "This is some proposal that needs voting",
//     chainId: 1,
//   },
// ];

export const getProposals = async () => {
  // For testing purposes
  // return mockedProposals;

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
