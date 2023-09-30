#!/usr/bin/bash

npx hardhat run ./scripts/deploy.ts --network polygon-mumbai 
npx hardhat run ./scripts/deploy.ts --network avalanche-fuji 

npx hardhat run ./scripts/attach.ts --network polygon-mumbai 
npx hardhat run ./scripts/attach.ts --network avalanche-fuji 