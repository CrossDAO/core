interface ChainInfo {
  relayer: string;
  selector: string;
}

export const supportedNetworks: Record<number, string> = {
  84531: "base-goerli",
  80001: "polygon-mumbai",
};

export const chains: Record<string, ChainInfo> = {
  "base-goerli": {
    relayer: "0xea8029CD7FCAEFFcD1F53686430Db0Fc8ed384E1",
    selector: "30",
  },
  "polygon-mumbai": {
    relayer: "0x0591C25ebd0580E0d4F27A82Fc2e24E7489CB5e0",
    selector: "5",
  },
};
