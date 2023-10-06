interface ChainInfo {
  router: string;
  linkToken: string;
  selector: string;
}

export const supportedNetworks: Record<number, string> = {
  11155111: "ethereum-sepolia",
  80001: "polygon-mumbai",
  420: "optimism-goerli",
  43113: "avalanche-fuji",
};

export const chains: Record<string, ChainInfo> = {
  "ethereum-sepolia": {
    router: "0xD0daae2231E9CB96b94C8512223533293C3693Bf",
    linkToken: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
    selector: "16015286601757825753",
  },
  "polygon-mumbai": {
    router: "0x70499c328e1E2a3c41108bd3730F6670a44595D1",
    linkToken: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
    selector: "12532609583862916517",
  },
  "optimism-goerli": {
    router: "0xEB52E9Ae4A9Fb37172978642d4C141ef53876f26",
    linkToken: "0xdc2CC710e42857672E7907CF474a69B63B93089f",
    selector: "2664363617261496610",
  },
  "avalanche-fuji": {
    router: "0x554472a2720E5E7D5D3C817529aBA05EEd5F82D8",
    linkToken: "0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846",
    selector: "14767482510784806043",
  },
};